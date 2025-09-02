<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DataCustomer extends Model
{
    use SoftDeletes;
    
    protected $table = 'mst_customer';
    protected $fillable = [
        'nama_lengkap',
        'alamat',
        'nama_instansi'
    ];

    public function setUpdatedAt($value)
    {
        if ($this->exists && !$this->isDeleting) {
            $this->attributes['updated_at'] = $value;
        }
        return $this;
    }

    protected $isDeleting = false;

    protected function performDeleteOnModel()
    {
        $this->isDeleting = true;
        if (! $this->forceDeleting) {
            $this->{$this->getDeletedAtColumn()} = $this->freshTimestamp();
            $this->saveQuietly();
        } else {
            parent::performDeleteOnModel();
        }
    }

    

    
    
    

    
}
