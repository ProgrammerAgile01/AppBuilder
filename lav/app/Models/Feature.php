<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feature extends Model
{
    use SoftDeletes;

    protected $table = 'features';

    protected $fillable = [
        'parent_id',
        'name',
        'code',
        'description',
        'type',
        'is_active',
        'order_number',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /* ================== RELATIONSHIPS ================== */

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('order_number')->orderBy('name');
    }

    // eager recursive
    public function childrenRecursive()
    {
        return $this->children()->with(['childrenRecursive']);
    }

    /* ================== SCOPES ================== */

    public function scopeRoot($q)
    {
        return $q->whereNull('parent_id');
    }

    public function scopeSearch($q, ?string $term)
    {
        if (!$term)
            return $q;
        return $q->where(function ($qq) use ($term) {
            $qq->where('name', 'like', "%{$term}%")
                ->orWhere('code', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }
    public function featureBuilders()
    {
        return $this->hasMany(FeatureBuilder::class);
    }

    public function scopeType($q, ?string $type)
    {
        if (!$type)
            return $q;
        return $q->where('type', $type);
    }
    /* Helper untuk tree FE */
    public function toTreeNode(int $level = 1): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->name,
            'type' => $this->type, // category|feature|subfeature
            'enabled' => false,
            'icon' => null,
            'level' => $level,
            'code' => $this->code,
            'module' => null,
            'children' => $this->children->map(fn($c) => $c->toTreeNode($level + 1))->values()->all(),
        ];
    }
}
