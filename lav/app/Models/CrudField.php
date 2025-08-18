<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrudField extends Model
{
    use HasFactory;

    protected $fillable = [
        'crud_builder_id',
        'field_category_id',
        'nama_kolom',
        'label_id',
        'label_en',
        'placeholder_id',
        'placeholder_en',
        'tipe_data',
        'panjang',
        'tipe_input',
        'enum_options',
        'is_required',
        'is_nullable',
        'is_unique',
        'is_readonly',
        'is_hide',
        'align',
        'default_value',
        'urutan',
        'aktifkan_relasi',
        'tipe_relasi',
        'tabel_relasi',
        'kolom_relasi'
    ];

    protected $casts = [
        'enum_options' => 'array',
        'is_required' => 'boolean',
        'is_nullable' => 'boolean',
        'is_unique' => 'boolean',
        'is_hide' => 'boolean',
        'is_readonly' => 'boolean',
        'aktifkan_relasi' => 'boolean',
    ];

    // relasi ke crudbuilder
    public function builder()
    {
        return $this->belongsTo(CrudBuilder::class, 'crud_builder_id');
    }

    // relasi ke kategori field
    public function category()
    {
        return $this->belongsTo(FieldCategory::class, 'field_category_id');
    }
}
