/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function( env ) {

  var userList = env.get( "ALLOWED_USERS" ),
      qs = require( "querystring" );

  userList = qs.parse( userList, ",", ":" );

  return {
    authenticateUser: function( req, res, next ) {
      console.log( req.cookies, req.session );
      var auth = req.cookies.auth;
      if ( !auth ) {
        return res.send( 401 );
      }
      req.user = auth.user;
      req.isAdmin = auth.isAdmin;
      next();
    },
    prefixAuth: function( req, res, next ) {
      var tags = req.body.tags;

      if ( !tags ) {
        return next;
      }

      for ( var i = tags.length - 1; i >= 0; i-- ) {
        tag = tags[ i ];
        if ( tag.indexOf( ":" ) !== -1 ) {
          if ( !req.isAdmin || tag.indexOf( req.user + ":" ) === 0 ) {
            return res.send( 403 );
          }
        }
      }
      next();
    }
  };
};
