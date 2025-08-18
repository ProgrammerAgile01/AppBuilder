<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parent_id',
        'level',
        'type',              // 'group' | 'module' | 'menu'
        'title',
        'icon',
        'color',
        'order_number',
        'crud_builder_id',
        // 'builder_table_name', // legacy (opsional)
        'route_path',
        'is_active',
        'note',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        'order_number' => 'integer',
        'color' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    protected $appends = ['is_deleted'];

    // ========== Relations ==========
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id')->withTrashed();
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order_number');
    }

    /**
     * Rekursif: anak-cucu + ikut soft-deleted
     */
    public function recursiveChildren(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')
            ->orderBy('order_number')
            ->withTrashed()
            ->with([
                'recursiveChildren' => function ($q) {
                    $q->withTrashed();
                }
            ]);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }

    public function crudBuilder(): BelongsTo
    {
        return $this->belongsTo(CrudBuilder::class)->withTrashed();
    }

    // ========== Scopes ==========
    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeByType($q, $type)
    {
        return $q->where('type', $type);
    }

    public function scopeGroup($q)
    {
        return $q->where('type', 'group');
    }

    public function scopeModule($q)
    {
        return $q->where('type', 'module');
    }

    public function scopeMenu($q)
    {
        return $q->where('type', 'menu');
    }

    public function scopeRoot($q)
    {
        return $q->whereNull('parent_id');
    }

    public function scopeOrdered($q)
    {
        return $q->orderBy('order_number');
    }

    // ========== Accessors ==========
    public function getIsDeletedAttribute(): bool
    {
        return !is_null($this->deleted_at);
    }

    // ========== Helpers ==========
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function getDescendantIds(): array
    {
        $ids = [];
        foreach ($this->children()->withTrashed()->get() as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $child->getDescendantIds());
        }
        return $ids;
    }

    public function toHierarchicalArray(): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'level' => $this->level,
            'type' => $this->type,
            'title' => $this->title,
            'icon' => $this->icon,
            'color' => $this->color,
            'order_number' => $this->order_number,
            'crud_builder_id' => $this->crud_builder_id,
            'builder_table_name' => $this->builder_table_name,
            'route_path' => $this->route_path,
            'is_active' => $this->is_active,
            'is_deleted' => $this->is_deleted,
            'note' => $this->note,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'children' => $this->children()->withTrashed()->get()
                ->map->toHierarchicalArray()->toArray(),
        ];
    }

    // ========== Model Events (integritas data) ==========
    protected static function booted()
    {
        // Auto-level dan order_number saat create
        static::creating(function (Menu $menu) {
            // level
            if (is_null($menu->level)) {
                $level = 1;
                if (!empty($menu->parent_id)) {
                    $parent = Menu::withTrashed()->find($menu->parent_id);
                    $level = ($parent->level ?? 0) + 1;
                }
                $menu->level = $level;
            }
            // order
            if (is_null($menu->order_number)) {
                $max = Menu::withTrashed()
                    ->where('parent_id', $menu->parent_id ?? null)
                    ->max('order_number') ?? 0;
                $menu->order_number = $max + 1;
            }
            // default aktif
            if (is_null($menu->is_active)) {
                $menu->is_active = true;
            }
        });

        // Jika parent pindah, update level & beri order bila kosong
        static::updating(function (Menu $menu) {
            if ($menu->isDirty('parent_id')) {
                $level = 1;
                if (!empty($menu->parent_id)) {
                    $parent = Menu::withTrashed()->find($menu->parent_id);
                    $level = ($parent->level ?? 0) + 1;
                }
                $menu->level = $level;

                if (is_null($menu->order_number)) {
                    $max = Menu::withTrashed()
                        ->where('parent_id', $menu->parent_id ?? null)
                        ->max('order_number') ?? 0;
                    $menu->order_number = $max + 1;
                }
            }
        });

        // Cascade soft delete ke anak
        static::deleting(function (Menu $menu) {
            if (!$menu->isForceDeleting()) {
                $menu->children()->withTrashed()->get()->each(function (Menu $child) {
                    $child->delete();
                });
            }
        });

        // Cascade restore ke anak
        static::restoring(function (Menu $menu) {
            $menu->children()->withTrashed()->get()->each(function (Menu $child) {
                $child->restore();
            });
        });

        // Cascade hard delete ke anak
        static::forceDeleted(function (Menu $menu) {
            $menu->children()->withTrashed()->get()->each(function (Menu $child) {
                $child->forceDelete();
            });
        });
    }
}
