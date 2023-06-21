
  

# Scanbot Image Picker for Cordova
Simple plugin that implements a very straight-forward native iOS & Android Image Picker, which features:

- Multiple Images Selection

- Customizable Parameters

- Typescript definitions

- Promisified API interface

# Installation

```bash
cordova plugin add cordova-plugin-scanbot-image-picker
```

# Usage

  

## Import Module

```typescript
import ScanbotImagePicker from 'cordova-plugin-scanbot-image-picker'
```

## Pick Single Image
Opens the native single image picker, and returns the selected image file URI.

  

**Example**

```typescript
const result = await ScanbotImagePicker.pickImage();

if (result.status == "OK") {
    let image = result.imageFileUri;
}
```

**Optional Parameters**

```typescript
export interface ScanbotImagePickerSingleConfiguration {
    /**
    * The quality of the images returned by the Image Picker, from 0 to 100 (default = 100)
    */
    imageQuality?:  number;
}
```

**Result**
```typescript
export interface ScanbotImagePickerSingleResult {
    status: "OK"  |  "CANCELED";
    imageFileUri?:  string;
}
```

## Pick Multiple Images

Opens the multiple image picker, and returns the selected image files URIs.

**Example**

```typescript
const result = await ScanbotImagePicker.pickImages();

if (result.status  ==  "OK") {
    let images = result.imageFilesUris;
}
```

**Optional Parameters**

```typescript
export interface ScanbotImagePickerMultipleConfiguration {
    /**
    * Maximum selectable images. Default is 0 (unlimited).
    */
    maxImages?:  number;
    /**
    * The quality of the images returned by the Image Picker, from 0 to 100 (default = 100).
    */
    imageQuality?:  number;
}
```

**Result**

```typescript
export interface ScanbotImagePickerMultipleResult {
    status: "OK"  |  "CANCELED";
    imageFilesUris: string[];
}
```

### Contributing
Contributions in the form of **issues**, **pull requests** and **suggestions** are very welcome. 

### Disclaimer
This package is still in beta and should be used with that in mind.

### License

[MIT](LICENSE)
