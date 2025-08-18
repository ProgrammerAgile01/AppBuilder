<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColumnContent extends Model
{
    protected $fillable = [
        'table_column_id',
        'source_column',
        'display_type',
        'label_id',
        'label_en',
        'styling',
        'position',
        'badge_config',
    ];

    protected $casts = [
        'styling' => 'array',
        'badge_config' => 'array',
    ];

    public function column() {
        return $this->belongsTo(TableColumn::class);
    }
}
