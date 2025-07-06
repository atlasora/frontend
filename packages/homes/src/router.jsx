import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from 'context/AuthProvider';
import Layout from 'containers/Layout/Layout';
import Loader from 'components/Loader/Loader';
import {
  HOME_PAGE,
  LISTING_POSTS_PAGE,
  SINGLE_POST_PAGE,
  PRIVACY_PAGE,
  LOGIN_PAGE,
  REGISTRATION_PAGE,
  FORGET_PASSWORD_PAGE,
  ADD_HOTEL_PAGE,
} from './settings/constant';

// Protected route component
function RequireAuth({ children }) {
  const { loggedIn } = useContext(AuthContext);
  const location = useLocation();

  if (!loggedIn) {
    return <Navigate to={LOGIN_PAGE} state={{ from: location }} />;
  }

  return children;
}

// Lazy-loaded public pages
const HomePage = React.lazy(() => import('containers/Home/Home'));
const ListingPage = React.lazy(() => import('containers/Listing/Listing'));
const SinglePageView = React.lazy(
  () => import('containers/SinglePage/SinglePageView'),
);
const PrivacyPage = React.lazy(() => import('containers/Privacy/Privacy'));
const SignInPage = React.lazy(() => import('containers/Auth/SignIn/SignIn'));
const SignUpPage = React.lazy(() => import('containers/Auth/SignUp/SignUp'));
const ForgetPasswordPage = React.lazy(
  () => import('containers/Auth/ForgetPassword'),
);
const NotFound = React.lazy(() => import('containers/404/404'));

// Lazy-loaded protected pages
const AddListingPage = React.lazy(
  () => import('containers/AddListing/AddListing'),
);
const ChangePassWord = React.lazy(
  () => import('containers/Agent/AccountSettings/ChangePassWordForm'),
);

// ✅ New lazy-loaded payment page
const PaymentPage = React.lazy(() => import('containers/Payment/Payment'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={HOME_PAGE} element={<Layout />}>
        {/* Public Routes */}
        <Route
          index
          element={
            <React.Suspense fallback={<Loader />}>
              <HomePage />
            </React.Suspense>
          }
        />
        <Route
          path={LISTING_POSTS_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <ListingPage />
            </React.Suspense>
          }
        />
        <Route
          path={`${SINGLE_POST_PAGE}/:slug`}
          element={
            <React.Suspense fallback={<Loader />}>
              <SinglePageView />
            </React.Suspense>
          }
        />
        <Route
          path="/payment"
          element={
            <React.Suspense fallback={<Loader />}>
              <PaymentPage />
            </React.Suspense>
          }
        />
        <Route
          path={PRIVACY_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <PrivacyPage />
            </React.Suspense>
          }
        />
        <Route
          path={LOGIN_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <SignInPage />
            </React.Suspense>
          }
        />
        <Route
          path={REGISTRATION_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <SignUpPage />
            </React.Suspense>
          }
        />
        <Route
          path={FORGET_PASSWORD_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <ForgetPasswordPage />
            </React.Suspense>
          }
        />

        {/* Protected Routes */}
        <Route
          path={ADD_HOTEL_PAGE}
          element={
            <React.Suspense fallback={<Loader />}>
              <RequireAuth>
                <AddListingPage />
              </RequireAuth>
            </React.Suspense>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <React.Suspense fallback={<Loader />}>
              <NotFound />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
