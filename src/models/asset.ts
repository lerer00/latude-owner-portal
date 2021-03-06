import { IAsset } from './asset';

export interface IAsset {
    id: string;
    name: string;
    description: string;
    active: boolean;
    parent: string;
    bookingsMap: any;
    bookings: Array<any>;
    amenities: Array<any>;
    price: number;
    currency: string;
}