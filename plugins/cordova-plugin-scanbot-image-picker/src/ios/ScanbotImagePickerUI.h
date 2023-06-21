/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/

#ifndef ScanbotImagePickerUI_h
#define ScanbotImagePickerUI_h
#import <GMImagePickerWithCloudMediaDownloading/GMImagePickerController.h>
#import <Photos/Photos.h>
#import <PhotosUI/PhotosUI.h>
@import UIKit;
@import Foundation;

#import "ScanbotImagePickerConfiguration.h"

typedef void (^SingleImagePickerCompletionBlock)(BOOL, NSString*);
typedef void (^MultipleImagePickerCompletionBlock)(BOOL, NSArray*);
static NSString *const Error_IOS_13 = @"iOS13_ImageManager_returned_nil";

@interface ScanbotImagePickerUI: NSObject<GMImagePickerControllerDelegate, PHPickerViewControllerDelegate>

/// Returns shared ScanbotImagePickerUI instance
+ (ScanbotImagePickerUI *)shared;

/// Starts an Image Picker to select just one image
/// @param configuration the desired configuration, of type ScanbotImagePickerSingleConfiguration
/// @param completion block function for handling the result (isCanceled: BOOL, imageFileUri: NSString*)
- (void) startSingleImagePicker:(ScanbotImagePickerSingleConfiguration*) configuration
                     completion:(SingleImagePickerCompletionBlock) completion;

/// Starts an Image Picker to select multiple images
/// @param configuration the desired configuration, of type ScanbotImagePickerMultipleConfiguration
/// @param completion block function for handling the result (isCanceled: BOOL, imageFilesUris: NSArray*)
- (void) startMultipleImagePicker:(ScanbotImagePickerMultipleConfiguration*) configuration
                       completion:(MultipleImagePickerCompletionBlock) completion;

/// Get the imagePicker viewController instance based on iOS version.
- (UIViewController*)getImagePickerViewController:(NSUInteger)imageSelectionLimit;
@end

#endif
