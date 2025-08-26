<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicles extends Model
{
    protected $table = 'vehicles';
    protected $fillable = [
        'plate_number',
        'brand',
        'model',
        'year',
        'color',
        'vehicle_type',
        'fuel_type',
        'transmission',
        'number_of_seats',
        'mileage',
        'daily_rate',
        'location',
        'status',
        'features',
        'front_photo',
        'side_photo',
        'back_photo',
        'description'
    ];

    protected $appends = ['front_photo_url', 'side_photo_url', 'back_photo_url'];
    
    

    
    public function getFrontPhotoUrlAttribute()
    {
        return $this->front_photo
            ? asset('storage/' . $this->front_photo)
            : null;
    }

    public function getSidePhotoUrlAttribute()
    {
        return $this->side_photo
            ? asset('storage/' . $this->side_photo)
            : null;
    }

    public function getBackPhotoUrlAttribute()
    {
        return $this->back_photo
            ? asset('storage/' . $this->back_photo)
            : null;
    }

}
