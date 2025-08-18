<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableColumn extends Model {
    protected $fillable = [
        'table_layout_id',
        'label_id',
        'label_en',
        'width',
        'alignment',
        'position',
        'column_layout',
        'image_settings',
    ];

    protected $casts = [
        'image_settings' => 'array',
    ];


    public function contents() {
        return $this->hasMany(ColumnContent::class);
    }

    public function layout() {
        return $this->belongsTo(TableLayout::class);
    }
}