<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $table = 'mst_products';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    // ⬇️ tambahkan db_name ke fillable
    protected $fillable = ['product_code', 'product_name', 'status', 'db_name'];

    protected static function booted()
    {
        static::creating(function (Product $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
