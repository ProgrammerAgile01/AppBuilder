<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FieldCategory extends Model
{
    protected $fillable = ['crud_builder_id', 'nama_kategori'];

    public function columns(): HasMany
    {
        return $this->hasMany(CrudField::class, 'field_category_id');
    }

    public function builder()
    {
        return $this->belongsTo(CrudBuilder::class, 'crud_builder_id');
    }
}
