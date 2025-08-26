<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrudStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'crud_builder_id',
        'judul_statistik_id',
        'judul_statistik_en',
        'icon',
        'query_angka',
        'query_resume'
    ];

    // relasi ke crudbuilder
    public function builder()
    {
        return $this->belongsTo(CrudBuilder::class, 'crud_builder_id');
    }
}
