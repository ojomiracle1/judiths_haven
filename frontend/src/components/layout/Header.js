import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingCartIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../NotificationBell';
import { useTranslation } from 'react-i18next';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { i18n } = useTranslation();

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <Disclosure as="nav" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 rounded-b-3xl border-b border-primary-100">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center gap-3">
                    <img src="/images/judiths-haven-logo.png" alt="Judith's Haven logo" className="h-12 w-auto rounded-xl shadow-md bg-primary-50 p-1" />
                    <span className="text-2xl font-extrabold text-primary-700 tracking-tight">Judith's Haven</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-primary-700 inline-flex items-center px-4 pt-1 pb-1 border-b-2 border-transparent hover:border-primary-300 hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 rounded-xl font-medium transition-all duration-200 bg-primary-50/0 hover:bg-primary-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={i18n.language}
                    onChange={e => i18n.changeLanguage(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    style={{ minWidth: 60 }}
                  >
                    <option value="en">EN</option>
                    <option value="fr">FR</option>
                  </select>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full bg-white shadow-card text-primary-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 transition-all duration-200"
                >
                  <span className="sr-only">View cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-400 shadow-card rounded-full">
                      {items.reduce((acc, item) => acc + item.qty, 0)}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  className="p-2 rounded-full bg-white shadow-card text-pink-300 hover:text-pink-500 hover:bg-pink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 transition-all duration-200"
                >
                  <span className="sr-only">View wishlist</span>
                  <HeartIcon className="h-6 w-6" aria-hidden="true" />
                </Link>

                <span className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 rounded-full">
                  <NotificationBell notifications={[]} />
                </span>

                {user ? (
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="bg-white shadow-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-200 transition-all duration-200">
                        <span className="sr-only">Open user menu</span>
                        <UserIcon className="h-8 w-8 text-primary-300" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-lg py-2 bg-white ring-1 ring-primary-100 focus:outline-none z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-primary-50' : '',
                                'block px-4 py-2 text-base text-primary-700 rounded-xl transition-colors duration-200'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        {user.isAdmin && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/dashboard"
                                className={classNames(
                                  active ? 'bg-primary-50' : '',
                                  'block px-4 py-2 text-base text-primary-700 rounded-xl transition-colors duration-200'
                                )}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logoutHandler}
                              className={classNames(
                                active ? 'bg-primary-50' : '',
                                'block w-full text-left px-4 py-2 text-base text-primary-700 rounded-xl transition-colors duration-200'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    to="/login"
                    className="ml-3 inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-xl text-white bg-primary-400 hover:bg-primary-500 shadow-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-200 transition-all duration-200"
                  >
                    Sign in
                  </Link>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-xl text-primary-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-200 transition-all duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden bg-white border-t border-primary-100 rounded-b-3xl">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className="block pl-4 pr-6 py-3 border-l-4 border-transparent text-lg font-medium text-primary-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors rounded-xl"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-primary-100">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-10 w-10 text-primary-300" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <div className="text-lg font-medium text-primary-700">{user.name}</div>
                      <div className="text-sm font-medium text-primary-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      to="/profile"
                      className="block px-4 py-2 text-lg font-medium text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
                    >
                      Your Profile
                    </Disclosure.Button>
                    {user.isAdmin && (
                      <Disclosure.Button
                        as={Link}
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-lg font-medium text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
                      >
                        Admin Dashboard
                      </Disclosure.Button>
                    )}
                    <Disclosure.Button
                      as="button"
                      onClick={logoutHandler}
                      className="block w-full text-left px-4 py-2 text-lg font-medium text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-4 py-2 text-lg font-medium text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
                  >
                    Sign in
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}