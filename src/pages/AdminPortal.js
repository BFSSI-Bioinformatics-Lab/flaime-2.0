// AdminPortal.js
import React from 'react';

const AdminPortal = () => {
  // Redirect to Django admin
  React.useEffect(() => {
    window.location.href = '/admin/';
  }, []);
  
  return <div>Redirecting to admin panel...</div>;
};

export default AdminPortal;
