<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardLayout extends Model
{
    protected $fillable = [
        'crud_builder_id',
        'name',
        'schema',
        'is_default'
    ];
    protected $casts = [
        'schema' => 'array',
        'is_default' => 'boolean'
    ];

    public function builder() 
    {
        return $this->belongsTo(CrudBuilder::class,'crud_builder_id');
    }
}
