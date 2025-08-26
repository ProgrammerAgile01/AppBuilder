<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrudBuilder extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'product_id',
        'kategori_crud',
        'judul',
        'judul_en',
        'nama_tabel',
        'judul_menu',
        'judul_menu_en',
        'deskripsi',
        'deskripsi_en',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // protected $with = ['fields', 'stats'];

    // relasi ke modules
    // public function modules()
    // {
    //     return $this->belongsTo(Modules::class, 'modules_id');
    // }

    // relasi kategori field
    public function fieldCategories()
    {
        return $this->hasMany(FieldCategory::class, 'crud_builder_id');
    }

    // relasi field
    public function fields()
    {
        return $this->hasMany(CrudField::class, 'crud_builder_id');
    }

    //relasi statistic
    public function stats()
    {
        return $this->hasMany(CrudStatistic::class, 'crud_builder_id');
    }

    // relasi mempunyai 1 table layout
    public function tableLayout()
    {
        return $this->hasOne(TableLayout::class);
    }

    // relasi 1 card layout
    public function cardLayout() 
    {
        return $this->hasOne(CardLayout::class, 'crud_builder_id')->where('is_default', true);
    }

    // relasi belongs ke product
    public function product() 
    {
        return $this->belongsTo(Product::class);
    }
}
