let desc = Object.getOwnPropertyDescriptor(m, k);

              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }

              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });

}
        }
    };

Object.defineProperty(exports, "__esModule", {
    value: true,
});

export const DisconnectReason = null;
export * from ./Auth;
export * from ./Bussines;
export * from ./Chat;
export * from ./Contact;
export * from ./GroupMetadata;
export * from ./State;
export * from ./MexUpdates;
export * from ./Message;
export * from ./Newsletter;
export * from ./Socket;
export * from ./Events;
export * from ./Product;
export * from ./Call;
export * from ./Signal;

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503,
};

export const DisconnectReason = DisconnectReason;
