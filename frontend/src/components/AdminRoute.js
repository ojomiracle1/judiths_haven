import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { logout } from '../features/auth/authSlice';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (!user || !user.token) {
        setIsVerified(false);
        return;
      }
      try {
        const res = await api.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (
          res.data &&
          (res.data.isAdmin === true || res.data.role === 'admin')
        ) {
          if (isMounted) setIsVerified(true);
        } else {
          if (isMounted) setIsVerified(false);
        }
      } catch (err) {
        dispatch(logout());
        if (isMounted) setIsVerified(false);
      }
    };
    verifyAdmin();
    return () => {
      isMounted = false;
    };
  }, [user, dispatch]);

  if (isVerified === null) return null; // or a spinner
  return isVerified ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;