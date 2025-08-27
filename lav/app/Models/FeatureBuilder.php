<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeatureBuilder extends Model
{
    use SoftDeletes;

    protected $table = 'mst_feature_builder';

    protected $fillable = [
        'product_id',
        'product_code',
        'parent_id',
        'crud_menu_id',
        'name',
        'feature_code',
        'type',
        'description',
        'price_addon',
        'trial_available',
        'trial_days',
        'order_number',
        'is_active',
    ];

    protected $casts = [
        'trial_available' => 'boolean',
        'is_active' => 'boolean',
        'price_addon' => 'integer',
        'trial_days' => 'integer',
        'order_number' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id'); // mst_products
    }

    public function parent()
    {
        return $this->belongsTo(FeatureBuilder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(FeatureBuilder::class, 'parent_id')->orderBy('order_number');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'crud_menu_id');
    }

    // Scopes
    public function scopeRoots($q)
    {
        return $q->whereNull('parent_id');
    }

    public function scopeForProduct($q, ?string $productId)
    {
        if (!$productId)
            return $q;
        return $q->where('product_id', $productId);
    }

    public function scopeSearch($q, ?string $term)
    {
        if (!$term)
            return $q;
        return $q->where(function ($qq) use ($term) {
            $qq->where('name', 'like', "%{$term}%")
                ->orWhere('feature_code', 'like', "%{$term}%");
        });
    }

    public function scopeType($q, ?string $type)
    {
        if (!$type)
            return $q;
        return $q->where('type', $type);
    }
}