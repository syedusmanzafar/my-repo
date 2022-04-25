import {
  w as ae,
  T as Pe,
  P as L,
  S as X,
  M as ce,
  a as C,
  b as Y,
  c as xe,
  K as $,
  d as ue,
  e as Ee,
  f as Ke,
  g as Le,
  h as fe,
  i as ee,
  j as te,
  s as ne,
  k as d,
  l as m,
  m as w,
  n as A,
  o as _,
  p as j,
  q as de,
  r as M,
  t as Re,
  u as re,
  L as z,
  v as x,
  x as K,
  y as f,
  z as G,
  A as J,
  B as Ce,
  C as Z,
  D as Be,
  E as Ie,
  F as me,
  G as Oe,
  H as pe,
  I as We,
  J as ge,
  N as be,
  O as we,
  Q as Ne,
  R as Me,
} from "./vendor.f7e3ef18.js";
const De = function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver((s) => {
    for (const o of s)
      if (o.type === "childList")
        for (const i of o.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(s) {
    const o = {};
    return (
      s.integrity && (o.integrity = s.integrity),
      s.referrerpolicy && (o.referrerPolicy = s.referrerpolicy),
      s.crossorigin === "use-credentials"
        ? (o.credentials = "include")
        : s.crossorigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const o = t(s);
    fetch(s.href, o);
  }
};
De();
const Q = ae(),
  I = ae({
    walletPublicKey: "",
    userBalance: 0,
    isWhiteListed: !1,
    solanaExplorerLink: "",
  });
var _e;
(function (n) {
  (n[(n.Sequential = 0)] = "Sequential"),
    (n[(n.Parallel = 1)] = "Parallel"),
    (n[(n.StopOnFailure = 2)] = "StopOnFailure");
})(_e || (_e = {}));
const Ue = async (
    n,
    e,
    t,
    r,
    s = 1,
    o = "singleGossip",
    i = (c, l) => {},
    u = (c, l) => !1,
    a
  ) => {
    const c = [];
    a || (a = await n.getRecentBlockhash(o));
    for (let b = 0; b < t.length; b++) {
      const p = t[b],
        g = r[b];
      if (p.length === 0) continue;
      let k = new Pe();
      p.forEach((T) => k.add(T)),
        (k.recentBlockhash = a.blockhash),
        k.setSigners(e.publicKey, ...g.map((T) => T.publicKey)),
        g.length > 0 && k.partialSign(...g),
        c.push(k);
    }
    const l = await e.signAllTransactions(c),
      v = [];
    let S = { breakEarly: !1, i: 0 };
    console.log(
      "Signed txns length",
      l.length,
      "vs handed in length",
      t.length
    );
    for (let b = 0; b < l.length; b++) {
      const p = Ge({ connection: n, signedTransaction: l[b] });
      if (
        (p
          .then(({ txid: g, slot: k }) => {
            i(g, b);
          })
          .catch((g) => {
            u(l[b], b), s === 2 && ((S.breakEarly = !0), (S.i = b));
          }),
        s !== 1)
      )
        try {
          await p;
        } catch (g) {
          if ((console.log("Caught failure", g), S.breakEarly))
            return (
              console.log("Died on ", S.i),
              { number: S.i, txs: await Promise.all(v) }
            );
        }
      else v.push(p);
    }
    return (
      s !== 1 && (await Promise.all(v)),
      { number: l.length, txs: await Promise.all(v) }
    );
  },
  ie = () => new Date().getTime() / 1e3,
  Fe = 15e3;
async function Ge({ signedTransaction: n, connection: e, timeout: t = Fe }) {
  const r = n.serialize(),
    s = ie();
  let o = 0;
  const i = await e.sendRawTransaction(r, { skipPreflight: !0 });
  console.log("Started awaiting confirmation for", i);
  let u = !1;
  (async () => {
    for (; !u && ie() - s < t; )
      e.sendRawTransaction(r, { skipPreflight: !0 }), await ye(500);
  })();
  try {
    const a = await he(i, t, e, "recent", !0);
    if (!a) throw new Error("Timed out awaiting confirmation on transaction");
    if (a.err)
      throw (
        (console.error(a.err),
        new Error("Transaction failed: Custom instruction error"))
      );
    o = (a == null ? void 0 : a.slot) || 0;
  } catch (a) {
    if ((console.error("Timeout Error caught", a), a.timeout))
      throw new Error("Timed out awaiting confirmation on transaction");
    let c = null;
    try {
      c = (await He(e, n, "single")).value;
    } catch {}
    if (c && c.err) {
      if (c.logs)
        for (let l = c.logs.length - 1; l >= 0; --l) {
          const v = c.logs[l];
          if (v.startsWith("Program log: "))
            throw new Error(
              "Transaction failed: " + v.slice("Program log: ".length)
            );
        }
      throw new Error(JSON.stringify(c.err));
    }
  } finally {
    u = !0;
  }
  return console.log("Latency", i, ie() - s), { txid: i, slot: o };
}
async function He(n, e, t) {
  e.recentBlockhash = await n._recentBlockhash(n._disableBlockhashCaching);
  const r = e.serializeMessage(),
    u = [
      e._serialize(r).toString("base64"),
      { encoding: "base64", commitment: t },
    ],
    a = await n._rpcRequest("simulateTransaction", u);
  if (a.error)
    throw new Error("failed to simulate transaction: " + a.error.message);
  return a.result;
}
async function he(n, e, t, r = "recent", s = !1) {
  let o = !1,
    i = { slot: 0, confirmations: 0, err: null },
    u = 0;
  return (
    (i = await new Promise(async (a, c) => {
      setTimeout(() => {
        o ||
          ((o = !0),
          console.log("Rejecting for timeout..."),
          c({ timeout: !0 }));
      }, e);
      try {
        u = t.onSignature(
          n,
          (l, v) => {
            (o = !0),
              (i = { err: l.err, slot: v.slot, confirmations: 0 }),
              l.err
                ? (console.log("Rejected via websocket", l.err), c(i))
                : (console.log("Resolved via websocket", l), a(i));
          },
          r
        );
      } catch (l) {
        (o = !0), console.error("WS error in setup", n, l);
      }
      for (; !o && s; )
        (async () => {
          try {
            const l = await t.getSignatureStatuses([n]);
            (i = l && l.value[0]),
              o ||
                (i
                  ? i.err
                    ? (console.log("REST error for", n, i), (o = !0), c(i.err))
                    : i.confirmations
                    ? (console.log("REST confirmation for", n, i),
                      (o = !0),
                      a(i))
                    : console.log("REST no confirmations for", n, i)
                  : console.log("REST null result for", n, i));
          } catch (l) {
            o || console.log("REST connection error: txid", n, l);
          }
        })(),
          await ye(2e3);
    })),
    t._signatureSubscriptions[u] && t.removeSignatureListener(u),
    (o = !0),
    console.log("Returning status", i),
    i
  );
}
function ye(n) {
  return new Promise((e) => setTimeout(e, n));
}
const se = new L("cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"),
  q = new L("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
  ke = new L("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  Ye = async (n, e, t) => {
    console.log(t.publicKey);
    const r = (await oe(t.publicKey, e))[0],
      s = n.state.tokenMint ? (await oe(n.state.tokenMint, e))[0] : e,
      o = n.id,
      i = [],
      u = [t],
      a = [],
      c = await qe(t.publicKey),
      l = await je(t.publicKey),
      [v, S] = await Ve(o),
      b = [
        X.createAccount({
          fromPubkey: e,
          newAccountPubkey: t.publicKey,
          space: ce.span,
          lamports:
            await n.program.provider.connection.getMinimumBalanceForRentExemption(
              ce.span
            ),
          programId: C,
        }),
        Y.createInitMintInstruction(C, t.publicKey, 0, e, e),
        ze(r, e, e, t.publicKey),
        Y.createMintToInstruction(C, t.publicKey, r, e, [], 1),
      ];
    if (n.state.whitelistMintSettings) {
      const p = new L(n.state.whitelistMintSettings.mint),
        g = (await oe(p, e))[0];
      if (
        (i.push({ pubkey: g, isWritable: !0, isSigner: !1 }),
        n.state.whitelistMintSettings.mode.burnEveryTime)
      ) {
        const k = $.generate();
        i.push({ pubkey: p, isWritable: !0, isSigner: !1 }),
          i.push({ pubkey: k.publicKey, isWritable: !1, isSigner: !0 }),
          u.push(k),
          (await n.program.provider.connection.getAccountInfo(g)) &&
            (b.push(Y.createApproveInstruction(C, g, k.publicKey, e, [], 1)),
            a.push(Y.createRevokeInstruction(C, g, e, [])));
      }
    }
    if (n.state.tokenMint) {
      const p = $.generate();
      u.push(p),
        i.push({ pubkey: s, isWritable: !0, isSigner: !1 }),
        i.push({ pubkey: p.publicKey, isWritable: !1, isSigner: !0 }),
        b.push(
          Y.createApproveInstruction(
            C,
            s,
            p.publicKey,
            e,
            [],
            n.state.price.toNumber()
          )
        ),
        a.push(Y.createRevokeInstruction(C, s, e, []));
    }
    b.push(
      await n.program.instruction.mintNft(S, {
        accounts: {
          candyMachine: o,
          candyMachineCreator: v,
          payer: e,
          wallet: n.state.treasury,
          mint: t.publicKey,
          metadata: c,
          masterEdition: l,
          mintAuthority: e,
          updateAuthority: e,
          tokenMetadataProgram: q,
          tokenProgram: C,
          systemProgram: X.programId,
          rent: ue,
          clock: Ee,
          recentBlockhashes: Ke,
          instructionSysvarAccount: Le,
        },
        remainingAccounts: i.length > 0 ? i : void 0,
      })
    );
    try {
      return (
        await Ue(
          n.program.provider.connection,
          n.program.provider.wallet,
          [b, a],
          [u, []]
        )
      ).txs.map((p) => p.txid);
    } catch (p) {
      console.log(p);
    }
    return [];
  },
  oe = async (n, e) =>
    await L.findProgramAddress([e.toBuffer(), C.toBuffer(), n.toBuffer()], ke),
  ze = (n, e, t, r) => {
    const s = [
      { pubkey: e, isSigner: !0, isWritable: !0 },
      { pubkey: n, isSigner: !1, isWritable: !0 },
      { pubkey: t, isSigner: !1, isWritable: !1 },
      { pubkey: r, isSigner: !1, isWritable: !1 },
      { pubkey: X.programId, isSigner: !1, isWritable: !1 },
      { pubkey: C, isSigner: !1, isWritable: !1 },
      { pubkey: ue, isSigner: !1, isWritable: !1 },
    ];
    return new xe({ keys: s, programId: ke, data: Buffer.from([]) });
  },
  je = async (n) =>
    (
      await L.findProgramAddress(
        [
          Buffer.from("metadata"),
          q.toBuffer(),
          n.toBuffer(),
          Buffer.from("edition"),
        ],
        q
      )
    )[0],
  qe = async (n) =>
    (
      await L.findProgramAddress(
        [Buffer.from("metadata"), q.toBuffer(), n.toBuffer()],
        q
      )
    )[0],
  Ve = async (n) =>
    await L.findProgramAddress(
      [Buffer.from("candy_machine"), n.toBuffer()],
      se
    ),
  Je = async (n, e) => {
    const t = await n.account.candyMachine.fetch(e),
      r = t.data.itemsAvailable.toNumber(),
      s = t.itemsRedeemed.toNumber(),
      o = r - s;
    return {
      id: e,
      program: n,
      state: {
        itemsAvailable: r,
        itemsRedeemed: s,
        itemsRemaining: o,
        isSoldOut: o === 0,
        isActive:
          t.data.goLiveDate.toNumber() < new Date().getTime() / 1e3 &&
          (t.endSettings
            ? t.endSettings.endSettingType.date
              ? t.endSettings.number.toNumber() > new Date().getTime() / 1e3
              : s < t.endSettings.number.toNumber()
            : !0),
        goLiveDate: t.data.goLiveDate,
        treasury: t.wallet,
        tokenMint: t.tokenMint,
        gatekeeper: t.data.gatekeeper,
        endSettings: t.data.endSettings,
        whitelistMintSettings: t.data.whitelistMintSettings,
        hiddenSettings: t.data.hiddenSettings,
        price: t.data.price,
      },
    };
  };
async function Ze(n, e) {
  try {
    const t = await fe.fetchIdl(se, e),
      r = new fe(t, se, e);
    return await Je(r, n);
  } catch (t) {
    console.error(t);
  }
}
async function Qe(n) {
  try {
    return (await n.connect({ onlyIfTrusted: !0 })).publicKey.toString();
  } catch {
    console.log("Unlock your wallet!");
  }
}
async function ve(n, e) {
  const t = new L(n);
  try {
    return await e.getBalance(t);
  } catch (r) {
    console.error(r);
  }
}
async function Se(n, e, t) {
  try {
    const r = await e.getParsedTokenAccountsByOwner(new L(n), { programId: C });
    for (let s = 0; s < r.value.length; s++) {
      const o = r.value[s],
        i = o.account.data.parsed.info.tokenAmount;
      if (o.account.data.parsed.info.mint === t.toString() && i.uiAmount > 0)
        return console.log("Welcome to the whitelist!"), !0;
    }
  } catch (r) {
    console.error(r);
  }
}
async function Xe(n) {
  try {
    return (await n.connect()).publicKey.toString();
  } catch (e) {
    console.error(e);
  }
}
function $e(n) {
  let e, t, r;
  function s(u, a) {
    return u[1] ? at : u[2] ? lt : ot;
  }
  let o = s(n),
    i = o(n);
  return {
    c() {
      (e = d("button")),
        i.c(),
        m(
          e,
          "class",
          "px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:bg-gray-400"
        ),
        (e.disabled = n[1]);
    },
    m(u, a) {
      w(u, e, a), i.m(e, null), t || ((r = re(e, "click", n[11])), (t = !0));
    },
    p(u, a) {
      o === (o = s(u)) && i
        ? i.p(u, a)
        : (i.d(1), (i = o(u)), i && (i.c(), i.m(e, null))),
        a & 2 && (e.disabled = u[1]);
    },
    d(u) {
      u && _(e), i.d(), (t = !1), r();
    },
  };
}
function et(n) {
  let e,
    t,
    r = (n[4]() / z).toFixed(2) + "",
    s,
    o,
    i,
    u;
  return {
    c() {
      (e = d("button")),
        (t = x("Insufficient Funds (")),
        (s = x(r)),
        (o = x(" SOL required)")),
        (i = K()),
        (u = d("div")),
        m(
          e,
          "class",
          "px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:bg-gray-400"
        ),
        (e.disabled = !0);
    },
    m(a, c) {
      w(a, e, c), f(e, t), f(e, s), f(e, o), w(a, i, c), w(a, u, c);
    },
    p(a, c) {
      c & 16 && r !== (r = (a[4]() / z).toFixed(2) + "") && G(s, r);
    },
    d(a) {
      a && _(e), a && _(i), a && _(u);
    },
  };
}
function tt(n) {
  let e,
    t,
    r = n[9].toUTCString() + "",
    s;
  return {
    c() {
      (e = d("button")),
        (t = x("Mint Live @ ")),
        (s = x(r)),
        m(e, "class", "btn-black"),
        (e.disabled = !0);
    },
    m(o, i) {
      w(o, e, i), f(e, t), f(e, s);
    },
    p(o, i) {
      i & 512 && r !== (r = o[9].toUTCString() + "") && G(s, r);
    },
    d(o) {
      o && _(e);
    },
  };
}
function nt(n) {
  let e;
  return {
    c() {
      (e = d("button")),
        (e.textContent = "Whitelist Presale Access Only"),
        m(e, "class", "btn-black"),
        (e.disabled = !0);
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    d(t) {
      t && _(e);
    },
  };
}
function rt(n) {
  let e;
  return {
    c() {
      (e = d("button")),
        (e.textContent = "Sold Out!"),
        m(
          e,
          "class",
          "px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold "
        );
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    d(t) {
      t && _(e);
    },
  };
}
function it(n) {
  let e, t, r;
  return {
    c() {
      (e = d("button")),
        (e.textContent = "Connect"),
        m(
          e,
          "class",
          "px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold"
        );
    },
    m(s, o) {
      w(s, e, o), t || ((r = re(e, "click", n[10])), (t = !0));
    },
    p: A,
    d(s) {
      s && _(e), (t = !1), r();
    },
  };
}
function st(n) {
  let e, t, r;
  return {
    c() {
      (e = d("button")),
        (e.textContent = "Connect to Wallet"),
        m(
          e,
          "class",
          "px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-bold"
        );
    },
    m(s, o) {
      w(s, e, o), t || ((r = re(e, "click", n[15])), (t = !0));
    },
    p: A,
    d(s) {
      s && _(e), (t = !1), r();
    },
  };
}
function ot(n) {
  let e,
    t,
    r = (n[4]() / z).toFixed(2) + "",
    s,
    o;
  return {
    c() {
      (e = d("span")), (t = x("Mint (")), (s = x(r)), (o = x(" SOL)"));
    },
    m(i, u) {
      w(i, e, u), f(e, t), f(e, s), f(e, o);
    },
    p(i, u) {
      u & 16 && r !== (r = (i[4]() / z).toFixed(2) + "") && G(s, r);
    },
    d(i) {
      i && _(e);
    },
  };
}
function lt(n) {
  let e;
  return {
    c() {
      (e = d("span")), (e.textContent = "Mint succesful! Mint another?");
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    d(t) {
      t && _(e);
    },
  };
}
function at(n) {
  let e;
  return {
    c() {
      (e = d("span")), (e.textContent = "Minting ...");
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    d(t) {
      t && _(e);
    },
  };
}
function ct(n) {
  let e, t;
  function r(i, u) {
    var a, c;
    return i[3]
      ? i[0].walletPublicKey
        ? i[7]
          ? rt
          : !i[8] && ((a = i[6]) == null ? void 0 : a.presale) && !i[5]
          ? nt
          : !i[8] && !((c = i[6]) == null ? void 0 : c.presale)
          ? tt
          : ((t == null || u & 17) && (t = i[0].userBalance < i[4]()),
            t ? et : $e)
        : it
      : st;
  }
  let s = r(n, -1),
    o = s(n);
  return {
    c() {
      (e = d("div")), o.c(), m(e, "class", "flex flex-col");
    },
    m(i, u) {
      w(i, e, u), o.m(e, null);
    },
    p(i, [u]) {
      s === (s = r(i, u)) && o
        ? o.p(i, u)
        : (o.d(1), (o = s(i)), o && (o.c(), o.m(e, null)));
    },
    i: A,
    o: A,
    d(i) {
      i && _(e), o.d();
    },
  };
}
const ut = 3e4;
function ft(n, e, t) {
  let r, s, o, i, u, a, c, l;
  j(n, I, (h) => t(0, (c = h))), j(n, Q, (h) => t(14, (l = h)));
  const v = "mainnet-beta".toString();
  let S = !1,
    b = !1,
    { solana: p } = window,
    { connection: g } = e;
  async function k() {
    var h;
    M(I, (c.walletPublicKey = await Xe(p)), c),
      c.walletPublicKey &&
        (M(I, (c.userBalance = await ve(c.walletPublicKey, g)), c),
        l.state.whitelistMintSettings &&
          M(
            I,
            (c.isWhiteListed = await Se(
              c.walletPublicKey,
              g,
              (h = l.state.whitelistMintSettings) == null ? void 0 : h.mint
            )),
            c
          ));
  }
  async function T() {
    try {
      if (
        (t(1, (S = !0)), (l == null ? void 0 : l.program) && c.walletPublicKey)
      ) {
        const h = $.generate(),
          D = (await Ye(l, new L(c.walletPublicKey), h))[0];
        let B = { err: !0 };
        D && (B = await he(D, ut, g, "singleGossip", !0)),
          (B == null ? void 0 : B.err)
            ? console.error("An error occurred")
            : (console.log("Success"), E(h.publicKey));
      }
    } catch (h) {
      console.error("An error occurred ", h);
    } finally {
      t(1, (S = !1));
    }
  }
  function E(h) {
    M(Q, (l.state.itemsRedeemed += 1), l),
      t(2, (b = !0)),
      M(
        I,
        (c.solanaExplorerLink =
          v == "devnet"
            ? `https://explorer.solana.com/address/${h}?cluster=devnet`
            : `https://explorer.solana.com/address/${h}`),
        c
      ),
      O();
  }
  function O() {
    Re({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  }
  function H() {
    t(3, (p = window.solana)),
      p ? location.reload() : window.open("https://phantom.app/", "_blank");
  }
  de(() => {
    t(3, (p = window.solana));
  });
  const V = () => H();
  return (
    (n.$$set = (h) => {
      "connection" in h && t(13, (g = h.connection));
    }),
    (n.$$.update = () => {
      var h, D;
      n.$$.dirty & 16384 &&
        t(
          9,
          (r = new Date(
            ((h = l == null ? void 0 : l.state.goLiveDate) == null
              ? void 0
              : h.toNumber()) * 1e3
          ))
        ),
        n.$$.dirty & 16384 &&
          ((D = l == null ? void 0 : l.state.whitelistMintSettings) == null ||
            D.discountPrice),
        n.$$.dirty & 16384 && t(8, (s = l == null ? void 0 : l.state.isActive)),
        n.$$.dirty & 16384 &&
          t(7, (o = l == null ? void 0 : l.state.isSoldOut)),
        n.$$.dirty & 16384 &&
          t(6, (i = l == null ? void 0 : l.state.whitelistMintSettings)),
        n.$$.dirty & 1 && t(5, (u = c.isWhiteListed)),
        n.$$.dirty & 16384 && (l == null || l.state.price),
        n.$$.dirty & 16385 &&
          t(
            4,
            (a = () => {
              var R, W, N, P, y;
              const B =
                  (N =
                    (W =
                      (R = l == null ? void 0 : l.state) == null
                        ? void 0
                        : R.whitelistMintSettings) == null
                      ? void 0
                      : W.discountPrice) == null
                    ? void 0
                    : N.toNumber(),
                F =
                  (y =
                    (P = l == null ? void 0 : l.state) == null
                      ? void 0
                      : P.price.toNumber()) != null
                    ? y
                    : 0;
              return c.isWhiteListed && B ? B : F;
            })
          );
    }),
    [c, S, b, p, a, u, i, o, s, r, k, T, H, g, l, V]
  );
}
class dt extends ee {
  constructor(e) {
    super();
    te(this, e, ft, ct, ne, { connection: 13 });
  }
}
function Te(n) {
  let e;
  return {
    c() {
      (e = d("div")),
        (e.innerHTML = `<img src="/star.svg" alt="" class="w-5 mr-2"/> 
      <div class="my-auto text-gray-600 text-sm">Whitelist</div>`),
        m(e, "class", "flex mr-auto");
    },
    m(t, r) {
      w(t, e, r);
    },
    d(t) {
      t && _(e);
    },
  };
}
function mt(n) {
  var b, p;
  let e,
    t,
    r,
    s,
    o,
    i = ((b = n[0].walletPublicKey) == null ? void 0 : b.slice(0, 8)) + "",
    u,
    a,
    c,
    l = (((p = n[0]) == null ? void 0 : p.userBalance) / z).toFixed(2) + "",
    v,
    S;
  return {
    c() {
      (e = d("div")),
        (t = d("div")),
        (r = d("span")),
        (s = K()),
        (o = d("span")),
        (u = x(i)),
        (a = K()),
        (c = d("div")),
        (v = x(l)),
        (S = x(" SOL")),
        m(r, "class", "my-auto mr-2 rounded-full h-2 w-2 bg-green-500"),
        m(o, "class", "my-auto text-gray-600 text-sm"),
        m(t, "class", "flex"),
        m(c, "class", "text-xs text-gray-600 text-right "),
        m(e, "class", "flex flex-col");
    },
    m(g, k) {
      w(g, e, k),
        f(e, t),
        f(t, r),
        f(t, s),
        f(t, o),
        f(o, u),
        f(e, a),
        f(e, c),
        f(c, v),
        f(c, S);
    },
    p(g, k) {
      var T, E;
      k & 1 &&
        i !==
          (i =
            ((T = g[0].walletPublicKey) == null ? void 0 : T.slice(0, 8)) +
            "") &&
        G(u, i),
        k & 1 &&
          l !==
            (l =
              (((E = g[0]) == null ? void 0 : E.userBalance) / z).toFixed(2) +
              "") &&
          G(v, l);
    },
    d(g) {
      g && _(e);
    },
  };
}
function pt(n) {
  let e, t, r;
  return {
    c() {
      (e = d("span")),
        (t = K()),
        (r = d("span")),
        (r.textContent = ""),
        m(e, "class", "my-auto mr-2 rounded-full h-2 w-2 bg-gray-500"),
        m(r, "class", "my-auto text-gray-600 text-sm");
    },
    m(s, o) {
      w(s, e, o), w(s, t, o), w(s, r, o);
    },
    p: A,
    d(s) {
      s && _(e), s && _(t), s && _(r);
    },
  };
}
function gt(n) {
  let e,
    t,
    r,
    s = n[0].isWhiteListed && Te();
  function o(a, c) {
    return a[0].walletPublicKey ? mt : pt;
  }
  let i = o(n),
    u = i(n);
  return {
    c() {
      (e = d("div")),
        s && s.c(),
        (t = K()),
        (r = d("div")),
        u.c(),
        m(r, "class", "flex"),
        m(e, "class", "justify-end flex p-3");
    },
    m(a, c) {
      w(a, e, c), s && s.m(e, null), f(e, t), f(e, r), u.m(r, null);
    },
    p(a, [c]) {
      a[0].isWhiteListed
        ? s || ((s = Te()), s.c(), s.m(e, t))
        : s && (s.d(1), (s = null)),
        i === (i = o(a)) && u
          ? u.p(a, c)
          : (u.d(1), (u = i(a)), u && (u.c(), u.m(r, null)));
    },
    i: A,
    o: A,
    d(a) {
      a && _(e), s && s.d(), u.d();
    },
  };
}
function bt(n, e, t) {
  let r;
  return j(n, I, (s) => t(0, (r = s))), [r];
}
class wt extends ee {
  constructor(e) {
    super();
    te(this, e, bt, gt, ne, {});
  }
}
function _t(n) {
  let e,
    t,
    r,
    s,
    o,
    i,
    u,
    a,
    c,
    l,
    v,
    S,
    b,
    p,
    g,
    k,
    T,
    E,
    O,
    H,
    V,
    h,
    D,
    B,
    F,
    R,
    W,
    N = kt();
  (r = new wt({})), (T = new dt({ props: { connection: n[2] } }));
  let P = n[5].solanaExplorerLink && Ae(n);
  return {
    c() {
      N && N.c(),
        (e = K()),
        (t = d("div")),
        me(r.$$.fragment),
        (s = K()),
        (o = d("hr")),
        (i = K()),
        (u = d("br")),
        (a = K()),
        (c = d("div")),
        (l = d("img")),
        (S = K()),
        (b = d("div")),
        (b.textContent = `${St}`),
        (p = K()),
        (g = d("div")),
        (g.textContent = `${Tt}`),
        (k = K()),
        me(T.$$.fragment),
        (E = K()),
        (O = d("div")),
        (H = x(n[4])),
        (V = x("/")),
        (h = x(n[3])),
        (D = x(" claimed")),
        (B = K()),
        (F = d("div")),
        P && P.c(),
        Oe(l.src, (v = xt)) || m(l, "src", v),
        m(l, "alt", ""),
        m(l, "class", "w-1/2 mx-auto m-5"),
        m(
          b,
          "class",
          "text-lg sm:text-2xl font-mono font-bold py-5 tracking-wider"
        ),
        m(g, "class", "text-sm sm:text-md font-semibold pb-5 text-gray-600 "),
        m(O, "class", "tracking-widest font-bold text-sm pt-3 text-gray-400"),
        m(F, "class", "flex flex-col pt-3"),
        m(c, "class", "p-6"),
        m(t, "class", "max-w-lg mx-auto bg-white rounded-lg my-12 border-2");
    },
    m(y, U) {
      N && N.m(y, U),
        w(y, e, U),
        w(y, t, U),
        pe(r, t, null),
        f(t, s),
        f(t, o),
        f(t, i),
        f(t, u),
        f(t, a),
        f(t, c),
        f(c, l),
        f(c, S),
        f(c, b),
        f(c, p),
        f(c, g),
        f(c, k),
        pe(T, c, null),
        f(c, E),
        f(c, O),
        f(O, H),
        f(O, V),
        f(O, h),
        f(O, D),
        f(c, B),
        f(c, F),
        P && P.m(F, null),
        (W = !0);
    },
    p(y, U) {
      const le = {};
      U & 4 && (le.connection = y[2]),
        T.$set(le),
        (!W || U & 16) && G(H, y[4]),
        (!W || U & 8) && G(h, y[3]),
        y[5].solanaExplorerLink
          ? P
            ? P.p(y, U)
            : ((P = Ae(y)), P.c(), P.m(F, null))
          : P && (P.d(1), (P = null));
    },
    i(y) {
      W ||
        (Z(r.$$.fragment, y),
        Z(T.$$.fragment, y),
        We(() => {
          R || (R = ge(t, we, {}, !0)), R.run(1);
        }),
        (W = !0));
    },
    o(y) {
      J(r.$$.fragment, y),
        J(T.$$.fragment, y),
        R || (R = ge(t, we, {}, !1)),
        R.run(0),
        (W = !1);
    },
    d(y) {
      N && N.d(y),
        y && _(e),
        y && _(t),
        be(r),
        be(T),
        P && P.d(),
        y && R && R.end();
    },
  };
}
function ht(n) {
  let e;
  return {
    c() {
      (e = d("div")),
        (e.innerHTML = '<div class="lds-hourglass m-auto"></div>'),
        m(e, "class", "h-full flex");
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    i: A,
    o: A,
    d(t) {
      t && _(e);
    },
  };
}
function yt(n) {
  let e;
  return {
    c() {
      (e = d("div")),
        (e.innerHTML = `<div class="m-auto">An error occurred. Please check if your environment variables have been
        populated correctly and redeploy the applcation.</div>`),
        m(e, "class", "h-full flex");
    },
    m(t, r) {
      w(t, e, r);
    },
    p: A,
    i: A,
    o: A,
    d(t) {
      t && _(e);
    },
  };
}
function kt(n) {
  let e, t;
  return {
    c() {
      (e = d("a")),
        (t = x(At)),
        m(e, "href", Pt),
        m(
          e,
          "class",
          "text-black tracking-widest underline underline-offset-4 decoration-2 font-mono"
        );
    },
    m(r, s) {
      w(r, e, s), f(e, t);
    },
    p: A,
    d(r) {
      r && _(e);
    },
  };
}
function Ae(n) {
  let e, t, r;
  return {
    c() {
      (e = d("a")),
        (t = x("View on Solana Explorer")),
        m(e, "href", (r = n[5].solanaExplorerLink)),
        m(e, "target", "_blank"),
        m(e, "class", "text-purple-700 font-semibold p-1");
    },
    m(s, o) {
      w(s, e, o), f(e, t);
    },
    p(s, o) {
      o & 32 && r !== (r = s[5].solanaExplorerLink) && m(e, "href", r);
    },
    d(s) {
      s && _(e);
    },
  };
}
function vt(n) {
  let e, t, r, s;
  const o = [yt, ht, _t],
    i = [];
  function u(a, c) {
    return a[1] ? 0 : a[0] && !a[1] ? 1 : 2;
  }
  return (
    (t = u(n)),
    (r = i[t] = o[t](n)),
    {
      c() {
        (e = d("main")), r.c(), m(e, "class", "h-screen");
      },
      m(a, c) {
        w(a, e, c), i[t].m(e, null), (s = !0);
      },
      p(a, [c]) {
        let l = t;
        (t = u(a)),
          t === l
            ? i[t].p(a, c)
            : (Be(),
              J(i[l], 1, 1, () => {
                i[l] = null;
              }),
              Ce(),
              (r = i[t]),
              r ? r.p(a, c) : ((r = i[t] = o[t](a)), r.c()),
              Z(r, 1),
              r.m(e, null));
      },
      i(a) {
        s || (Z(r), (s = !0));
      },
      o(a) {
        J(r), (s = !1);
      },
      d(a) {
        a && _(e), i[t].d();
      },
    }
  );
}
const St = "",
  Tt = "",
  At = "",
  Pt = "https://licksters.io",
  xt = "";
function Et(n, e, t) {
  let r, s, o, i;
  j(n, Q, (E) => t(6, (o = E))), j(n, I, (E) => t(5, (i = E)));
  let { solana: u } = window;
  const a =
      "https://blue-snowy-breeze.solana-mainnet.quiknode.pro/c50329d5a445a39136618c59de2e989a1e6e3150/".toString(),
    c = "mainnet-beta".toString(),
    l = "JCKHYPKa7jv23rLFpR2MtJ4aZyb9Zu3uGKF2MUvepinm".toString(),
    v = { preflightCommitment: "processed" };
  let S = !0,
    b = !1,
    p,
    g,
    k;
  function T() {
    return !a || !l || !c
      ? (a || console.error("RPC URL not populated"),
        l || console.error("Candy Machine ID not populated"),
        c || console.error("Environment not populated"),
        !0)
      : l.length < 32 || l.length > 44
      ? (console.error(
          "Candy Machine Public Key is invalid. Enter a length in-between 32 and 44 characters"
        ),
        !0)
      : !1;
  }
  return (
    de(async () => {
      var E;
      (u = window.solana),
        t(1, (b = T())),
        !b &&
          (t(2, (p = new Ie(a))),
          (g = new Ne(p, u, v.preflightCommitment)),
          (k = new L(l)),
          M(Q, (o = await Ze(k, g)), o),
          (u == null ? void 0 : u.isPhantom) &&
            (M(I, (i.walletPublicKey = await Qe(u)), i),
            i.walletPublicKey &&
              (M(I, (i.userBalance = await ve(i.walletPublicKey, p)), i),
              o.state.whitelistMintSettings &&
                M(
                  I,
                  (i.isWhiteListed = await Se(
                    i.walletPublicKey,
                    p,
                    (E = o.state.whitelistMintSettings) == null
                      ? void 0
                      : E.mint
                  )),
                  i
                ))),
          t(0, (S = !1)));
    }),
    (n.$$.update = () => {
      n.$$.dirty & 64 && t(4, (r = o == null ? void 0 : o.state.itemsRedeemed)),
        n.$$.dirty & 64 &&
          t(3, (s = o == null ? void 0 : o.state.itemsAvailable));
    }),
    [S, b, p, s, r, i, o]
  );
}
class Kt extends ee {
  constructor(e) {
    super();
    te(this, e, Et, vt, ne, {});
  }
}
window.Buffer = Me.Buffer;
new Kt({ target: document.getElementById("app") });
