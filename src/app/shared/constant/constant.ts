import { environment } from "../../../environments/environment.prod";

export const admin = 'admin';
export const client = 'client';
export const CarModelsUrl = environment.apiUrl+'/carModels';
export const CarsUrl = environment.apiUrl+'/cars';
export const cloudName = 'dniaphcwx';
export const uploadPreset = 'rentCarsMart';
export const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
export const folderName = 'rent_cars';
