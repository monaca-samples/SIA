/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/

#ifndef ScanbotImagePickerConfiguration_h
#define ScanbotImagePickerConfiguration_h

// MARK: - Single Image Picker Configuration
@interface ScanbotImagePickerSingleConfiguration: NSObject
    @property (nonatomic, assign) NSUInteger imageQuality;
@end

// MARK: - Multiple Image Picker Configuration
@interface ScanbotImagePickerMultipleConfiguration: NSObject
    @property (nonatomic, assign) NSUInteger maxImages;
    @property (nonatomic, assign) NSUInteger imageQuality;
@end

#endif
