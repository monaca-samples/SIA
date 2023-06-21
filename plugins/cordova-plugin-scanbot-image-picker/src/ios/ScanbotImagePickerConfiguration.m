/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/

#import "ScanbotImagePickerConfiguration.h"

// MARK: - Single Image Picker Configuration
@implementation ScanbotImagePickerSingleConfiguration

- (instancetype)init
{
    self = [super init];
    if (self) {
        self.imageQuality = 100;
    }
    return self;
}

@end

// MARK: - Multiple Image Picker Configuration
@implementation ScanbotImagePickerMultipleConfiguration

- (instancetype)init
{
    self = [super init];
    if (self) {
        self.maxImages = 0;
        self.imageQuality = 100;
    }
    return self;
}

@end
