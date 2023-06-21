/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/

///// Base Cordova API
export type ScanbotImagePickerStatus = "OK" | "CANCELED";

// Configurations
export interface ScanbotImagePickerSingleConfiguration {
    /**
     * The quality of the images returned by the Image Picker, from 0 to 1 (default = 1.0)
     */
    imageQuality?: number;
}

export interface ScanbotImagePickerMultipleConfiguration {
    /**
     * Maximum selectable images. Default is 0 (unlimited).
     */
    maxImages?: number;   
    /**
     * The quality of the images returned by the Image Picker, from 0 to 1 (default = 1.0)
     */
    imageQuality?: number;
}

// Results
export interface ScanbotImagePickerGenericResult {
    status: ScanbotImagePickerStatus;
    message?: string;
}

export interface ScanbotImagePickerSingleResult {
    imageFileUri?: string;
}

export interface ScanbotImagePickerMultipleResult {
    imageFilesUris: string[];
}

export interface ScanbotImagePickerModule {
    pickImage(configuration?: ScanbotImagePickerSingleConfiguration): Promise<ScanbotImagePickerGenericResult & ScanbotImagePickerSingleResult>;
    pickImages(configuration?: ScanbotImagePickerMultipleConfiguration): Promise<ScanbotImagePickerGenericResult & ScanbotImagePickerMultipleResult>;
}

declare let ScanbotImagePicker: ScanbotImagePickerModule;

export default ScanbotImagePicker;
