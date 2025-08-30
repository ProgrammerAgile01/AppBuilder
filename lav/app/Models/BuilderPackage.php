<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuilderPackage extends Model
{
    use SoftDeletes;

    protected $table = 'packages';

    protected $fillable = [
        'menu_id',
        'parent_id',
        'name',
        'description',
        'price',
        'max_users',
        'status',
        'subscribers',
        'features',
        'menu_access', // ← kita pakai ini untuk MENYIMPAN ARRAY ID menu
    ];

    protected $casts = [
        'price' => 'integer',
        'max_users' => 'integer',
        'subscribers' => 'integer',
        'features' => 'array',
        'menu_access' => 'array',   // ← penting: akan berisi array of menu IDs (normalized)
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
    public function featureBuilders()
    {
        return $this->hasMany(FeatureBuilder::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BuilderPackage::class, 'parent_id')->withTrashed();
    }

    public function children(): HasMany
    {
        return $this->hasMany(BuilderPackage::class, 'parent_id')->withTrashed();
    }

    // Scopes
    public function scopeRoot($q)
    {
        return $q->whereNull('parent_id');
    }

    public function scopeByMenu($q, int $menuId)
    {
        return $q->where('menu_id', $menuId);
    }
}
