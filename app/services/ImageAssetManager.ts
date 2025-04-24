import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageAsset {
  id: string;
  uri: string;
  name: string;
  category: string;
  tags: string[];
  words: string[];
  dateAdded: string;
  activityTypes: string[];
}

export interface ImageCategory {
  id: string;
  name: string;
  description: string;
}

class ImageAssetManager {
  private static instance: ImageAssetManager;
  private readonly IMAGE_DIRECTORY = `${FileSystem.documentDirectory}images/`;
  private readonly METADATA_KEY = '@clearsay_image_metadata';
  private readonly CATEGORIES_KEY = '@clearsay_categories';

  private constructor() {
    this.initializeDirectory();
  }

  public static getInstance(): ImageAssetManager {
    if (!ImageAssetManager.instance) {
      ImageAssetManager.instance = new ImageAssetManager();
    }
    return ImageAssetManager.instance;
  }

  private async initializeDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(this.IMAGE_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.IMAGE_DIRECTORY, { intermediates: true });
    }
  }

  private async saveImageMetadata(newAsset: ImageAsset): Promise<void> {
    const allImages = await this.getAllImages();
    allImages.push(newAsset);
    await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(allImages));
  }

  // Add a new image asset
  public async addImage(
    imageUri: string,
    name: string,
    category: string,
    tags: string[] = [],
    words: string[] = [],
    activityTypes: string[] = []
  ): Promise<ImageAsset> {
    const id = `img_${Date.now()}`;
    const newPath = `${this.IMAGE_DIRECTORY}${id}.jpg`;

    // Copy image to app directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: newPath,
    });

    const newAsset: ImageAsset = {
      id,
      uri: newPath,
      name,
      category,
      tags,
      words,
      dateAdded: new Date().toISOString(),
      activityTypes,
    };

    // Save metadata
    await this.saveImageMetadata(newAsset);
    return newAsset;
  }

  // Pick image from device
  public async pickImage(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Permission to access media library was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  }

  // Get all images
  public async getAllImages(): Promise<ImageAsset[]> {
    try {
      const metadata = await AsyncStorage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : [];
    } catch (error) {
      console.error('Error getting images:', error);
      return [];
    }
  }

  // Get images by category
  public async getImagesByCategory(category: string): Promise<ImageAsset[]> {
    const allImages = await this.getAllImages();
    return allImages.filter(img => img.category === category);
  }

  // Get images by activity type
  public async getImagesByActivity(activityType: string): Promise<ImageAsset[]> {
    const allImages = await this.getAllImages();
    return allImages.filter(img => img.activityTypes.includes(activityType));
  }

  // Delete image
  public async deleteImage(id: string): Promise<void> {
    const allImages = await this.getAllImages();
    const imageToDelete = allImages.find(img => img.id === id);

    if (imageToDelete) {
      // Delete file
      await FileSystem.deleteAsync(imageToDelete.uri, { idempotent: true });

      // Update metadata
      const updatedImages = allImages.filter(img => img.id !== id);
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(updatedImages));
    }
  }

  // Update image metadata
  public async updateImageMetadata(
    id: string,
    updates: Partial<Omit<ImageAsset, 'id' | 'uri'>>
  ): Promise<void> {
    const allImages = await this.getAllImages();
    const updatedImages = allImages.map(img =>
      img.id === id ? { ...img, ...updates } : img
    );
    await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(updatedImages));
  }

  // Manage categories
  public async getCategories(): Promise<ImageCategory[]> {
    try {
      const categories = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  public async addCategory(name: string, description: string = ''): Promise<void> {
    const categories = await this.getCategories();
    const newCategory: ImageCategory = {
      id: `cat_${Date.now()}`,
      name,
      description,
    };
    categories.push(newCategory);
    await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  // Search images by name, tags, or words
  public async searchImages(query: string): Promise<ImageAsset[]> {
    const allImages = await this.getAllImages();
    const searchTerm = query.toLowerCase();

    return allImages.filter(img =>
      img.name.toLowerCase().includes(searchTerm) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      img.words.some(word => word.toLowerCase().includes(searchTerm))
    );
  }
}

export default ImageAssetManager; 