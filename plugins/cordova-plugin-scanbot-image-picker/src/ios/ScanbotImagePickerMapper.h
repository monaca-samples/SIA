/*
    Scanbot Image Picker Cordova Plugin
    Copyright (c) 2021 doo GmbH

    This code is licensed under MIT license (see LICENSE for details)

    Created by Marco Saia on 07.05.2021
*/

#ifndef ScanbotImagePickerMapper_h
#define ScanbotImagePickerMapper_h

@interface ScanbotImagePickerMapper : NSObject
+ (void)populateInstance:(id)instance
          fromDictionary:(NSDictionary*)dictionary;
@end

#endif /* ScanbotImagePickerMapper_h */
