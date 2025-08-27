<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class TemplateFrontend extends Model
{
    use SoftDeletes;

    protected $table = 'mst_template_frontend';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'template_code',
        'template_name',
        'status',
    ];

    protected static function booted()
    {
        static::creating(function (TemplateFrontend $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // relasi ke product
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
