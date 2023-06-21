/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/
package io.scanbot.cordova.plugin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.camera.core.impl.utils.Exif;
import androidx.exifinterface.media.ExifInterface;

import com.opensooq.supernova.gligar.GligarPicker;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Locale;

import io.scanbot.cordova.plugin.utils.JsonArgs;

public class ScanbotImagePicker extends CordovaPlugin {

    private static final int SINGLE_IMAGE_PICKER_REQUEST_CODE = 999001;
    private static final int MULTIPLE_IMAGE_PICKER_REQUEST_CODE = 999002;

    private CallbackContext callbackContext;
    private int imageQuality = 100;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        final JSONObject jsonArgs = (args.length() > 0 ? args.getJSONObject(0) : new JSONObject());
        
        this.callbackContext = callbackContext;

        switch(action) {
            case "pickImage":
                startSingleImagePicker(jsonArgs);
                break;

            case "pickImages":
                startMultipleImagePicker(jsonArgs);
                break;

            default:
                return false;
        }

        return true;
    }

    /**
     * Opens the default system Image Picker for a single-image selection
     * @param args Map of optional arguments for customisation
     */
    private void startSingleImagePicker(final JSONObject args) {

        Intent intent = new Intent();

        intent.setType("image/*");
        intent.setAction(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);

        try {
            this.imageQuality = args.getInt("imageQuality");
        } catch (Exception ignored) {}

        cordova.setActivityResultCallback(ScanbotImagePicker.this);
        cordova.startActivityForResult(this, intent, SINGLE_IMAGE_PICKER_REQUEST_CODE);
    }

    /**
     * Opens GligarPicker image picker Activity for multi-image selection
     * @param args Map of optional arguments for customisation
     */
    private void startMultipleImagePicker(final JSONObject args) {
        
        GligarPicker picker = new GligarPicker().requestCode(MULTIPLE_IMAGE_PICKER_REQUEST_CODE);

        try {
            picker = picker.limit(args.getInt("maxImages"));
        } catch (Exception ignored) {}

        try {
            this.imageQuality = args.getInt("imageQuality");
        } catch (Exception ignored) {}

        cordova.setActivityResultCallback(ScanbotImagePicker.this);
        picker.withActivity(cordova.getActivity()).show();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);

        final boolean isCanceled = resultCode != Activity.RESULT_OK;

        switch (requestCode) {

            case SINGLE_IMAGE_PICKER_REQUEST_CODE:
                if (intent == null || intent.getData() == null) {
                    return;
                }
                handleSingleImagePickerResult(isCanceled, intent.getData().toString());
                break;

            case MULTIPLE_IMAGE_PICKER_REQUEST_CODE:
                if (intent == null || intent.getExtras() == null) {
                    return;
                }
                String[] imageFilesUris = intent.getExtras().getStringArray(GligarPicker.IMAGES_RESULT);
                if (imageFilesUris == null) {
                    imageFilesUris = new String[] {};
                }

                handleMultipleImagePickerResult(isCanceled, imageFilesUris);
                break;
        }
    }

    /**--------------------------------
     *        RESULTS HANDLING
     *---------------------------------

     /**
     * Handles Single Image Picker's result and returns the JSON data to Cordova JS
     * @param isCanceled true if the operation was canceled by the user, false otherwise
     * @param imageFileUri the URI of the selected file
     */
    private void handleSingleImagePickerResult(final boolean isCanceled, final String imageFileUri) {
        if (isCanceled) {
            callbackContext.success(new JsonArgs().put("status", "CANCELED").jsonObj());
            return;
        }

        if (imageFileUri == null) {
            callbackContext.error("Found null 'imageFileUri' in handleSingleImagePickerResult");
            return;
        }

        final String outputImagePath = compressImage(imageFileUri, this.imageQuality);
        final String outputImageUri = Uri.fromFile(new File(outputImagePath)).toString();

        JsonArgs outResult = new JsonArgs();
        outResult.put("status", "OK");
        outResult.put("imageFileUri", outputImageUri);
        callbackContext.success(outResult.jsonObj());
    }

    /**
     * Handles Multiple Image Picker's result and returns the JSON data to Cordova JS
     * @param isCanceled true if the operation was canceled by the user, false otherwise
     * @param imageFilesUris an array containing the file URIs for all the images selected
     */
    private void handleMultipleImagePickerResult(final boolean isCanceled, final String[] imageFilesUris) {
        if (isCanceled) {
            callbackContext.success(new JsonArgs().put("status", "CANCELED").jsonObj());
            return;
        }

        JSONArray imageUris = new JSONArray();
        for(String path : imageFilesUris) {
            String outPath = path;
            if (this.imageQuality != 100) {
                outPath = compressImage(path, this.imageQuality);
            }
            try {
                final String imageUri = Uri.fromFile(new File(outPath)).toString();
                imageUris.put(imageUri);
            } catch(Exception e) {
                e.printStackTrace();
            }
        }

        JsonArgs outResult = new JsonArgs();
        
        outResult.put("status", "OK");
        outResult.put("imageFilesUris", imageUris);

        callbackContext.success(outResult.jsonObj());
    }

    /**--------------------------------
     *    PRIVATE UTILITY FUNCTIONS
     *---------------------------------
    /**
     * Compresses the image located at the given path, down to the given quality,
     * and returns the compressed image path.
     *
     * @param imagePath the path of the original image
     * @param quality the desired quality for the compressed image (from 0 to 100)
     * @return the path of the compressed image path, or null in case of failure
     */
    private String compressImage(final String imagePath, final int quality) {
        try {
            // Retrieves Bitmap
            final Uri imageUri = Uri.parse(imagePath);
            Bitmap originalBitmap = null;

            if (imagePath.startsWith("content:/")) {
                originalBitmap = MediaStore.Images.Media.getBitmap(this.cordova.getContext().getContentResolver(), imageUri);
            } else {
                originalBitmap = BitmapFactory.decodeFile(imageUri.getPath(), new BitmapFactory.Options());
            }

            if (originalBitmap == null) {
                throw new IOException("Could not load image. Bitmap is null");
            }

            // Compresses Bitmap
            final ByteArrayOutputStream decodeStream = new ByteArrayOutputStream();
            originalBitmap.compress(Bitmap.CompressFormat.JPEG, quality, decodeStream);

            // Decides Output Path
            final String outputFileName = String.format(Locale.US, "%d.jpg", imagePath.hashCode());
            final File outputDir = cordova.getActivity().getCacheDir();
            final String outputPath = outputDir + "/" + outputFileName;

            // Saves File
            final OutputStream tmpStream = new FileOutputStream(outputPath);
            decodeStream.writeTo(tmpStream);
            decodeStream.close();
            tmpStream.close();

            // Corrects the image rotation using bitmap metadata, if necessary
            final Bitmap bitmap = handleImageRotation(imagePath, originalBitmap);
            final OutputStream outputStream = new FileOutputStream(outputPath);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream);
            outputStream.close();

            return outputPath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private Bitmap handleImageRotation(String imagePath, Bitmap bitmap) {

        Bitmap rotatedBitmap = null;
        try {

            ExifInterface ei;

            if (imagePath.startsWith("content:/")) {
                InputStream inputStream = cordova
                        .getContext()
                        .getContentResolver()
                        .openInputStream(Uri.parse(imagePath));

                ei = new ExifInterface(inputStream);
            } else {
                ei = new ExifInterface(imagePath);
            }

            int orientation = ei.getAttributeInt(ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_UNDEFINED);

            switch (orientation) {

                case ExifInterface.ORIENTATION_ROTATE_90:
                    rotatedBitmap = rotateImage(bitmap, 90);
                    break;

                case ExifInterface.ORIENTATION_ROTATE_180:
                    rotatedBitmap = rotateImage(bitmap, 180);
                    break;

                case ExifInterface.ORIENTATION_ROTATE_270:
                    rotatedBitmap = rotateImage(bitmap, 270);
                    break;

                case ExifInterface.ORIENTATION_NORMAL:
                default:
                    rotatedBitmap = bitmap;
            }
        } catch(IOException e) {
            e.printStackTrace();
            return bitmap;
        }

        return rotatedBitmap;
    }

    private static Bitmap rotateImage(Bitmap source, float angle) {
        Matrix matrix = new Matrix();
        matrix.postRotate(angle);
        return Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(),
                matrix, true);
    }
}
