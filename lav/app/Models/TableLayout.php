<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableLayout extends Model {
    protected $fillable = [
        'crud_builder_id',
        'layout_name_id',
        'layout_name_en',
        'show_actions',
        'actions_position',
        'row_height',
        'show_border',
        'alternate_row_colors'
    ];

    public function columns() {
        return $this->hasMany(TableColumn::class);
    }

    public function builder() {
        return $this->belongsTo(CrudBuilder::class, 'crud_builder_id');
    }
}
