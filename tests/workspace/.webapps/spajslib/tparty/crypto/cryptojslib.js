


var CryptoJS = CryptoJS || function (p, h) {
        var i = {}, l = i.lib = {}, r = l.Base = function () {
            function a() {}
            return {
                extend: function (e) {
                    a.prototype = this;
                    var c = new a;
                    e && c.mixIn(e);
                    c.$super = this;
                    return c
                },
                create: function () {
                    var a = this.extend();
                    a.init.apply(a, arguments);
                    return a
                },
                init: function () {},
                mixIn: function (a) {
                    for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                    a.hasOwnProperty("toString") && (this.toString = a.toString)
                },
                clone: function () {
                    return this.$super.extend(this)
                }
            }
        }(),
            o = l.WordArray = r.extend({
                init: function (a, e) {
                    a = this.words = a || [];
                    this.sigBytes = e != h ? e : 4 * a.length
                },
                toString: function (a) {
                    return (a || s).stringify(this)
                },
                concat: function (a) {
                    var e = this.words,
                        c = a.words,
                        b = this.sigBytes,
                        a = a.sigBytes;
                    this.clamp();
                    if (b % 4) for (var d = 0; d < a; d++) e[b + d >>> 2] |= (c[d >>> 2] >>> 24 - 8 * (d % 4) & 255) << 24 - 8 * ((b + d) % 4);
                    else if (65535 < c.length) for (d = 0; d < a; d += 4) e[b + d >>> 2] = c[d >>> 2];
                    else e.push.apply(e, c);
                    this.sigBytes += a;
                    return this
                },
                clamp: function () {
                    var a = this.words,
                        e = this.sigBytes;
                    a[e >>> 2] &= 4294967295 << 32 - 8 * (e % 4);
                    a.length = p.ceil(e / 4)
                },
                clone: function () {
                    var a = r.clone.call(this);
                    a.words = this.words.slice(0);
                    return a
                },
                random: function (a) {
                    for (var e = [], c = 0; c < a; c += 4) e.push(4294967296 * p.random() | 0);
                    return o.create(e, a)
                }
            }),
            m = i.enc = {}, s = m.Hex = {
                stringify: function (a) {
                    for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) {
                        var d = e[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                        c.push((d >>> 4).toString(16));
                        c.push((d & 15).toString(16))
                    }
                    return c.join("")
                },
                parse: function (a) {
                    for (var e = a.length, c = [], b = 0; b < e; b += 2) c[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
                    return o.create(c, e / 2)
                }
            }, n = m.Latin1 = {
                stringify: function (a) {
                    for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) c.push(String.fromCharCode(e[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
                    return c.join("")
                },
                parse: function (a) {
                    for (var e = a.length, c = [], b = 0; b < e; b++) c[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
                    return o.create(c, e)
                }
            }, k = m.Utf8 = {
                stringify: function (a) {
                    try {
                        return decodeURIComponent(escape(n.stringify(a)))
                    } catch (e) {
                        throw Error("Malformed UTF-8 data");
                    }
                },
                parse: function (a) {
                    return n.parse(unescape(encodeURIComponent(a)))
                }
            }, f = l.BufferedBlockAlgorithm = r.extend({
                reset: function () {
                    this._data = o.create();
                    this._nDataBytes = 0
                },
                _append: function (a) {
                    "string" == typeof a && (a = k.parse(a));
                    this._data.concat(a);
                    this._nDataBytes += a.sigBytes
                },
                _process: function (a) {
                    var e = this._data,
                        c = e.words,
                        b = e.sigBytes,
                        d = this.blockSize,
                        q = b / (4 * d),
                        q = a ? p.ceil(q) : p.max((q | 0) - this._minBufferSize, 0),
                        a = q * d,
                        b = p.min(4 * a, b);
                    if (a) {
                        for (var j = 0; j < a; j += d) this._doProcessBlock(c, j);
                        j = c.splice(0, a);
                        e.sigBytes -= b
                    }
                    return o.create(j, b)
                },
                clone: function () {
                    var a = r.clone.call(this);
                    a._data = this._data.clone();
                    return a
                },
                _minBufferSize: 0
            });
        l.Hasher = f.extend({
            init: function () {
                this.reset()
            },
            reset: function () {
                f.reset.call(this);
                this._doReset()
            },
            update: function (a) {
                this._append(a);
                this._process();
                return this
            },
            finalize: function (a) {
                a && this._append(a);
                this._doFinalize();
                return this._hash
            },
            clone: function () {
                var a = f.clone.call(this);
                a._hash = this._hash.clone();
                return a
            },
            blockSize: 16,
            _createHelper: function (a) {
                return function (e, c) {
                    return a.create(c).finalize(e)
                }
            },
            _createHmacHelper: function (a) {
                return function (e, c) {
                    return g.HMAC.create(a, c).finalize(e)
                }
            }
        });
        var g = i.algo = {};
        return i
    }(Math);
(function () {
    var p = CryptoJS,
        h = p.lib.WordArray;
    p.enc.Base64 = {
        stringify: function (i) {
            var l = i.words,
                h = i.sigBytes,
                o = this._map;
            i.clamp();
            for (var i = [], m = 0; m < h; m += 3) for (var s = (l[m >>> 2] >>> 24 - 8 * (m % 4) & 255) << 16 | (l[m + 1 >>> 2] >>> 24 - 8 * ((m + 1) % 4) & 255) << 8 | l[m + 2 >>> 2] >>> 24 - 8 * ((m + 2) % 4) & 255, n = 0; 4 > n && m + 0.75 * n < h; n++) i.push(o.charAt(s >>> 6 * (3 - n) & 63));
            if (l = o.charAt(64)) for (; i.length % 4;) i.push(l);
            return i.join("")
        },
        parse: function (i) {
            var i = i.replace(/\s/g, ""),
                l = i.length,
                r = this._map,
                o = r.charAt(64);
            o && (o = i.indexOf(o), - 1 != o && (l = o));
            for (var o = [], m = 0, s = 0; s < l; s++) if (s % 4) {
                var n = r.indexOf(i.charAt(s - 1)) << 2 * (s % 4),
                    k = r.indexOf(i.charAt(s)) >>> 6 - 2 * (s % 4);
                o[m >>> 2] |= (n | k) << 24 - 8 * (m % 4);
                m++
            }
            return h.create(o, m)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
})();
(function (p) {
    function h(f, g, a, e, c, b, d) {
        f = f + (g & a | ~g & e) + c + d;
        return (f << b | f >>> 32 - b) + g
    }
    function i(f, g, a, e, c, b, d) {
        f = f + (g & e | a & ~e) + c + d;
        return (f << b | f >>> 32 - b) + g
    }
    function l(f, g, a, e, c, b, d) {
        f = f + (g ^ a ^ e) + c + d;
        return (f << b | f >>> 32 - b) + g
    }
    function r(f, g, a, e, c, b, d) {
        f = f + (a ^ (g | ~e)) + c + d;
        return (f << b | f >>> 32 - b) + g
    }
    var o = CryptoJS,
        m = o.lib,
        s = m.WordArray,
        m = m.Hasher,
        n = o.algo,
        k = [];
    (function () {
        for (var f = 0; 64 > f; f++) k[f] = 4294967296 * p.abs(p.sin(f + 1)) | 0
    })();
    n = n.MD5 = m.extend({
        _doReset: function () {
            this._hash = s.create([1732584193, 4023233417,
            2562383102, 271733878])
        },
        _doProcessBlock: function (f, g) {
            for (var a = 0; 16 > a; a++) {
                var e = g + a,
                    c = f[e];
                f[e] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360
            }
            for (var e = this._hash.words, c = e[0], b = e[1], d = e[2], q = e[3], a = 0; 64 > a; a += 4) 16 > a ? (c = h(c, b, d, q, f[g + a], 7, k[a]), q = h(q, c, b, d, f[g + a + 1], 12, k[a + 1]), d = h(d, q, c, b, f[g + a + 2], 17, k[a + 2]), b = h(b, d, q, c, f[g + a + 3], 22, k[a + 3])) : 32 > a ? (c = i(c, b, d, q, f[g + (a + 1) % 16], 5, k[a]), q = i(q, c, b, d, f[g + (a + 6) % 16], 9, k[a + 1]), d = i(d, q, c, b, f[g + (a + 11) % 16], 14, k[a + 2]), b = i(b, d, q, c, f[g + a % 16], 20, k[a + 3])) : 48 > a ? (c = l(c, b, d, q, f[g + (3 * a + 5) % 16], 4, k[a]), q = l(q, c, b, d, f[g + (3 * a + 8) % 16], 11, k[a + 1]), d = l(d, q, c, b, f[g + (3 * a + 11) % 16], 16, k[a + 2]), b = l(b, d, q, c, f[g + (3 * a + 14) % 16], 23, k[a + 3])) : (c = r(c, b, d, q, f[g + 3 * a % 16], 6, k[a]), q = r(q, c, b, d, f[g + (3 * a + 7) % 16], 10, k[a + 1]), d = r(d, q, c, b, f[g + (3 * a + 14) % 16], 15, k[a + 2]), b = r(b, d, q, c, f[g + (3 * a + 5) % 16], 21, k[a + 3]));
            e[0] = e[0] + c | 0;
            e[1] = e[1] + b | 0;
            e[2] = e[2] + d | 0;
            e[3] = e[3] + q | 0
        },
        _doFinalize: function () {
            var f = this._data,
                g = f.words,
                a = 8 * this._nDataBytes,
                e = 8 * f.sigBytes;
            g[e >>> 5] |= 128 << 24 - e % 32;
            g[(e + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            f.sigBytes = 4 * (g.length + 1);
            this._process();
            f = this._hash.words;
            for (g = 0; 4 > g; g++) a = f[g], f[g] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360
        }
    });
    o.MD5 = m._createHelper(n);
    o.HmacMD5 = m._createHmacHelper(n)
})(Math);
(function () {
    var p = CryptoJS,
        h = p.lib,
        i = h.Base,
        l = h.WordArray,
        h = p.algo,
        r = h.EvpKDF = i.extend({
            cfg: i.extend({
                keySize: 4,
                hasher: h.MD5,
                iterations: 1
            }),
            init: function (i) {
                this.cfg = this.cfg.extend(i)
            },
            compute: function (i, m) {
                for (var h = this.cfg, n = h.hasher.create(), k = l.create(), f = k.words, g = h.keySize, h = h.iterations; f.length < g;) {
                    a && n.update(a);
                    var a = n.update(i).finalize(m);
                    n.reset();
                    for (var e = 1; e < h; e++) a = n.finalize(a), n.reset();
                    k.concat(a)
                }
                k.sigBytes = 4 * g;
                return k
            }
        });
    p.EvpKDF = function (i, l, h) {
        return r.create(h).compute(i,
        l)
    }
})();
CryptoJS.lib.Cipher || function (p) {
    var h = CryptoJS,
        i = h.lib,
        l = i.Base,
        r = i.WordArray,
        o = i.BufferedBlockAlgorithm,
        m = h.enc.Base64,
        s = h.algo.EvpKDF,
        n = i.Cipher = o.extend({
            cfg: l.extend(),
            createEncryptor: function (b, d) {
                return this.create(this._ENC_XFORM_MODE, b, d)
            },
            createDecryptor: function (b, d) {
                return this.create(this._DEC_XFORM_MODE, b, d)
            },
            init: function (b, d, a) {
                this.cfg = this.cfg.extend(a);
                this._xformMode = b;
                this._key = d;
                this.reset()
            },
            reset: function () {
                o.reset.call(this);
                this._doReset()
            },
            process: function (b) {
                this._append(b);
                return this._process()
            },
            finalize: function (b) {
                b && this._append(b);
                return this._doFinalize()
            },
            keySize: 4,
            ivSize: 4,
            _ENC_XFORM_MODE: 1,
            _DEC_XFORM_MODE: 2,
            _createHelper: function () {
                return function (b) {
                    return {
                        encrypt: function (a, q, j) {
                            return ("string" == typeof q ? c : e).encrypt(b, a, q, j)
                        },
                        decrypt: function (a, q, j) {
                            return ("string" == typeof q ? c : e).decrypt(b, a, q, j)
                        }
                    }
                }
            }()
        });
    i.StreamCipher = n.extend({
        _doFinalize: function () {
            return this._process(!0)
        },
        blockSize: 1
    });
    var k = h.mode = {}, f = i.BlockCipherMode = l.extend({
        createEncryptor: function (b, a) {
            return this.Encryptor.create(b,
            a)
        },
        createDecryptor: function (b, a) {
            return this.Decryptor.create(b, a)
        },
        init: function (b, a) {
            this._cipher = b;
            this._iv = a
        }
    }),
        k = k.CBC = function () {
            function b(b, a, d) {
                var c = this._iv;
                c ? this._iv = p : c = this._prevBlock;
                for (var e = 0; e < d; e++) b[a + e] ^= c[e]
            }
            var a = f.extend();
            a.Encryptor = a.extend({
                processBlock: function (a, d) {
                    var c = this._cipher,
                        e = c.blockSize;
                    b.call(this, a, d, e);
                    c.encryptBlock(a, d);
                    this._prevBlock = a.slice(d, d + e)
                }
            });
            a.Decryptor = a.extend({
                processBlock: function (a, d) {
                    var c = this._cipher,
                        e = c.blockSize,
                        f = a.slice(d, d + e);
                    c.decryptBlock(a, d);
                    b.call(this, a, d, e);
                    this._prevBlock = f
                }
            });
            return a
        }(),
        g = (h.pad = {}).Pkcs7 = {
            pad: function (b, a) {
                for (var c = 4 * a, c = c - b.sigBytes % c, e = c << 24 | c << 16 | c << 8 | c, f = [], g = 0; g < c; g += 4) f.push(e);
                c = r.create(f, c);
                b.concat(c)
            },
            unpad: function (b) {
                b.sigBytes -= b.words[b.sigBytes - 1 >>> 2] & 255
            }
        };
    i.BlockCipher = n.extend({
        cfg: n.cfg.extend({
            mode: k,
            padding: g
        }),
        reset: function () {
            n.reset.call(this);
            var b = this.cfg,
                a = b.iv,
                b = b.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) var c = b.createEncryptor;
            else c = b.createDecryptor,
            this._minBufferSize = 1;
            this._mode = c.call(b, this, a && a.words)
        },
        _doProcessBlock: function (b, a) {
            this._mode.processBlock(b, a)
        },
        _doFinalize: function () {
            var b = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                b.pad(this._data, this.blockSize);
                var a = this._process(!0)
            } else a = this._process(!0), b.unpad(a);
            return a
        },
        blockSize: 4
    });
    var a = i.CipherParams = l.extend({
        init: function (a) {
            this.mixIn(a)
        },
        toString: function (a) {
            return (a || this.formatter).stringify(this)
        }
    }),
        k = (h.format = {}).OpenSSL = {
            stringify: function (a) {
                var d = a.ciphertext,
                    a = a.salt,
                    d = (a ? r.create([1398893684, 1701076831]).concat(a).concat(d) : d).toString(m);
                return d = d.replace(/(.{64})/g, "$1\n")
            },
            parse: function (b) {
                var b = m.parse(b),
                    d = b.words;
                if (1398893684 == d[0] && 1701076831 == d[1]) {
                    var c = r.create(d.slice(2, 4));
                    d.splice(0, 4);
                    b.sigBytes -= 16
                }
                return a.create({
                    ciphertext: b,
                    salt: c
                })
            }
        }, e = i.SerializableCipher = l.extend({
            cfg: l.extend({
                format: k
            }),
            encrypt: function (b, d, c, e) {
                var e = this.cfg.extend(e),
                    f = b.createEncryptor(c, e),
                    d = f.finalize(d),
                    f = f.cfg;
                return a.create({
                    ciphertext: d,
                    key: c,
                    iv: f.iv,
                    algorithm: b,
                    mode: f.mode,
                    padding: f.padding,
                    blockSize: b.blockSize,
                    formatter: e.format
                })
            },
            decrypt: function (a, c, e, f) {
                f = this.cfg.extend(f);
                c = this._parse(c, f.format);
                return a.createDecryptor(e, f).finalize(c.ciphertext)
            },
            _parse: function (a, c) {
                return "string" == typeof a ? c.parse(a) : a
            }
        }),
        h = (h.kdf = {}).OpenSSL = {
            compute: function (b, c, e, f) {
                f || (f = r.random(8));
                b = s.create({
                    keySize: c + e
                }).compute(b, f);
                e = r.create(b.words.slice(c), 4 * e);
                b.sigBytes = 4 * c;
                return a.create({
                    key: b,
                    iv: e,
                    salt: f
                })
            }
        }, c = i.PasswordBasedCipher = e.extend({
            cfg: e.cfg.extend({
                kdf: h
            }),
            encrypt: function (a, c, f, j) {
                j = this.cfg.extend(j);
                f = j.kdf.compute(f, a.keySize, a.ivSize);
                j.iv = f.iv;
                a = e.encrypt.call(this, a, c, f.key, j);
                a.mixIn(f);
                return a
            },
            decrypt: function (a, c, f, j) {
                j = this.cfg.extend(j);
                c = this._parse(c, j.format);
                f = j.kdf.compute(f, a.keySize, a.ivSize, c.salt);
                j.iv = f.iv;
                return e.decrypt.call(this, a, c, f.key, j)
            }
        })
}();
(function () {
    var p = CryptoJS,
        h = p.lib.BlockCipher,
        i = p.algo,
        l = [],
        r = [],
        o = [],
        m = [],
        s = [],
        n = [],
        k = [],
        f = [],
        g = [],
        a = [];
    (function () {
        for (var c = [], b = 0; 256 > b; b++) c[b] = 128 > b ? b << 1 : b << 1 ^ 283;
        for (var d = 0, e = 0, b = 0; 256 > b; b++) {
            var j = e ^ e << 1 ^ e << 2 ^ e << 3 ^ e << 4,
                j = j >>> 8 ^ j & 255 ^ 99;
            l[d] = j;
            r[j] = d;
            var i = c[d],
                h = c[i],
                p = c[h],
                t = 257 * c[j] ^ 16843008 * j;
            o[d] = t << 24 | t >>> 8;
            m[d] = t << 16 | t >>> 16;
            s[d] = t << 8 | t >>> 24;
            n[d] = t;
            t = 16843009 * p ^ 65537 * h ^ 257 * i ^ 16843008 * d;
            k[j] = t << 24 | t >>> 8;
            f[j] = t << 16 | t >>> 16;
            g[j] = t << 8 | t >>> 24;
            a[j] = t;
            d ? (d = i ^ c[c[c[p ^ i]]], e ^= c[c[e]]) : d = e = 1
        }
    })();
    var e = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
        i = i.AES = h.extend({
            _doReset: function () {
                for (var c = this._key, b = c.words, d = c.sigBytes / 4, c = 4 * ((this._nRounds = d + 6) + 1), i = this._keySchedule = [], j = 0; j < c; j++) if (j < d) i[j] = b[j];
                else {
                    var h = i[j - 1];
                    j % d ? 6 < d && 4 == j % d && (h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255]) : (h = h << 8 | h >>> 24, h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255], h ^= e[j / d | 0] << 24);
                    i[j] = i[j - d] ^ h
                }
                b = this._invKeySchedule = [];
                for (d = 0; d < c; d++) j = c - d, h = d % 4 ? i[j] : i[j - 4], b[d] = 4 > d || 4 >= j ? h : k[l[h >>> 24]] ^ f[l[h >>> 16 & 255]] ^ g[l[h >>> 8 & 255]] ^ a[l[h & 255]]
            },
            encryptBlock: function (a, b) {
                this._doCryptBlock(a, b, this._keySchedule, o, m, s, n, l)
            },
            decryptBlock: function (c, b) {
                var d = c[b + 1];
                c[b + 1] = c[b + 3];
                c[b + 3] = d;
                this._doCryptBlock(c, b, this._invKeySchedule, k, f, g, a, r);
                d = c[b + 1];
                c[b + 1] = c[b + 3];
                c[b + 3] = d
            },
            _doCryptBlock: function (a, b, d, e, f, h, i, g) {
                for (var l = this._nRounds, k = a[b] ^ d[0], m = a[b + 1] ^ d[1], o = a[b + 2] ^ d[2], n = a[b + 3] ^ d[3], p = 4, r = 1; r < l; r++) var s = e[k >>> 24] ^ f[m >>> 16 & 255] ^ h[o >>> 8 & 255] ^ i[n & 255] ^ d[p++],
                    u = e[m >>> 24] ^ f[o >>> 16 & 255] ^ h[n >>> 8 & 255] ^ i[k & 255] ^ d[p++],
                    v = e[o >>> 24] ^ f[n >>> 16 & 255] ^ h[k >>> 8 & 255] ^ i[m & 255] ^ d[p++],
                    n = e[n >>> 24] ^ f[k >>> 16 & 255] ^ h[m >>> 8 & 255] ^ i[o & 255] ^ d[p++],
                    k = s,
                    m = u,
                    o = v;
                s = (g[k >>> 24] << 24 | g[m >>> 16 & 255] << 16 | g[o >>> 8 & 255] << 8 | g[n & 255]) ^ d[p++];
                u = (g[m >>> 24] << 24 | g[o >>> 16 & 255] << 16 | g[n >>> 8 & 255] << 8 | g[k & 255]) ^ d[p++];
                v = (g[o >>> 24] << 24 | g[n >>> 16 & 255] << 16 | g[k >>> 8 & 255] << 8 | g[m & 255]) ^ d[p++];
                n = (g[n >>> 24] << 24 | g[k >>> 16 & 255] << 16 | g[m >>> 8 & 255] << 8 | g[o & 255]) ^ d[p++];
                a[b] = s;
                a[b + 1] = u;
                a[b + 2] = v;
                a[b + 3] = n
            },
            keySize: 8
        });
    p.AES = h._createHelper(i)
})();



﻿(function () {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var BlockCipher = C_lib.BlockCipher;
    var C_algo = C.algo;

    
    var PC1 = [
        57, 49, 41, 33, 25, 17, 9,  1,
        58, 50, 42, 34, 26, 18, 10, 2,
        59, 51, 43, 35, 27, 19, 11, 3,
        60, 52, 44, 36, 63, 55, 47, 39,
        31, 23, 15, 7,  62, 54, 46, 38,
        30, 22, 14, 6,  61, 53, 45, 37,
        29, 21, 13, 5,  28, 20, 12, 4
    ];

    
    var PC2 = [
        14, 17, 11, 24, 1,  5,
        3,  28, 15, 6,  21, 10,
        23, 19, 12, 4,  26, 8,
        16, 7,  27, 20, 13, 2,
        41, 52, 31, 37, 47, 55,
        30, 40, 51, 45, 33, 48,
        44, 49, 39, 56, 34, 53,
        46, 42, 50, 36, 29, 32
    ];

    
    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

    
    var SBOX_P = [
        {
            0x00000000: 0x00808200, 0x10000000: 0x00008000, 0x20000000: 0x00808002, 0x30000000: 0x00000002,
            0x40000000: 0x00000200, 0x50000000: 0x00808202, 0x60000000: 0x00800202, 0x70000000: 0x00800000,
            0x80000000: 0x00000202, 0x90000000: 0x00800200, 0xa0000000: 0x00008200, 0xb0000000: 0x00808000,
            0xc0000000: 0x00008002, 0xd0000000: 0x00800002, 0xe0000000: 0x00000000, 0xf0000000: 0x00008202,
            0x08000000: 0x00000000, 0x18000000: 0x00808202, 0x28000000: 0x00008202, 0x38000000: 0x00008000,
            0x48000000: 0x00808200, 0x58000000: 0x00000200, 0x68000000: 0x00808002, 0x78000000: 0x00000002,
            0x88000000: 0x00800200, 0x98000000: 0x00008200, 0xa8000000: 0x00808000, 0xb8000000: 0x00800202,
            0xc8000000: 0x00800002, 0xd8000000: 0x00008002, 0xe8000000: 0x00000202, 0xf8000000: 0x00800000,
            0x00000001: 0x00008000, 0x10000001: 0x00000002, 0x20000001: 0x00808200, 0x30000001: 0x00800000,
            0x40000001: 0x00808002, 0x50000001: 0x00008200, 0x60000001: 0x00000200, 0x70000001: 0x00800202,
            0x80000001: 0x00808202, 0x90000001: 0x00808000, 0xa0000001: 0x00800002, 0xb0000001: 0x00008202,
            0xc0000001: 0x00000202, 0xd0000001: 0x00800200, 0xe0000001: 0x00008002, 0xf0000001: 0x00000000,
            0x08000001: 0x00808202, 0x18000001: 0x00808000, 0x28000001: 0x00800000, 0x38000001: 0x00000200,
            0x48000001: 0x00008000, 0x58000001: 0x00800002, 0x68000001: 0x00000002, 0x78000001: 0x00008202,
            0x88000001: 0x00008002, 0x98000001: 0x00800202, 0xa8000001: 0x00000202, 0xb8000001: 0x00808200,
            0xc8000001: 0x00800200, 0xd8000001: 0x00000000, 0xe8000001: 0x00008200, 0xf8000001: 0x00808002
        },
        {
            0x00000000: 0x40084010, 0x01000000: 0x00004000, 0x02000000: 0x00080000, 0x03000000: 0x40080010,
            0x04000000: 0x40000010, 0x05000000: 0x40084000, 0x06000000: 0x40004000, 0x07000000: 0x00000010,
            0x08000000: 0x00084000, 0x09000000: 0x40004010, 0x0a000000: 0x40000000, 0x0b000000: 0x00084010,
            0x0c000000: 0x00080010, 0x0d000000: 0x00000000, 0x0e000000: 0x00004010, 0x0f000000: 0x40080000,
            0x00800000: 0x40004000, 0x01800000: 0x00084010, 0x02800000: 0x00000010, 0x03800000: 0x40004010,
            0x04800000: 0x40084010, 0x05800000: 0x40000000, 0x06800000: 0x00080000, 0x07800000: 0x40080010,
            0x08800000: 0x00080010, 0x09800000: 0x00000000, 0x0a800000: 0x00004000, 0x0b800000: 0x40080000,
            0x0c800000: 0x40000010, 0x0d800000: 0x00084000, 0x0e800000: 0x40084000, 0x0f800000: 0x00004010,
            0x10000000: 0x00000000, 0x11000000: 0x40080010, 0x12000000: 0x40004010, 0x13000000: 0x40084000,
            0x14000000: 0x40080000, 0x15000000: 0x00000010, 0x16000000: 0x00084010, 0x17000000: 0x00004000,
            0x18000000: 0x00004010, 0x19000000: 0x00080000, 0x1a000000: 0x00080010, 0x1b000000: 0x40000010,
            0x1c000000: 0x00084000, 0x1d000000: 0x40004000, 0x1e000000: 0x40000000, 0x1f000000: 0x40084010,
            0x10800000: 0x00084010, 0x11800000: 0x00080000, 0x12800000: 0x40080000, 0x13800000: 0x00004000,
            0x14800000: 0x40004000, 0x15800000: 0x40084010, 0x16800000: 0x00000010, 0x17800000: 0x40000000,
            0x18800000: 0x40084000, 0x19800000: 0x40000010, 0x1a800000: 0x40004010, 0x1b800000: 0x00080010,
            0x1c800000: 0x00000000, 0x1d800000: 0x00004010, 0x1e800000: 0x40080010, 0x1f800000: 0x00084000
        },
        {
            0x00000000: 0x00000104, 0x00100000: 0x00000000, 0x00200000: 0x04000100, 0x00300000: 0x00010104,
            0x00400000: 0x00010004, 0x00500000: 0x04000004, 0x00600000: 0x04010104, 0x00700000: 0x04010000,
            0x00800000: 0x04000000, 0x00900000: 0x04010100, 0x00a00000: 0x00010100, 0x00b00000: 0x04010004,
            0x00c00000: 0x04000104, 0x00d00000: 0x00010000, 0x00e00000: 0x00000004, 0x00f00000: 0x00000100,
            0x00080000: 0x04010100, 0x00180000: 0x04010004, 0x00280000: 0x00000000, 0x00380000: 0x04000100,
            0x00480000: 0x04000004, 0x00580000: 0x00010000, 0x00680000: 0x00010004, 0x00780000: 0x00000104,
            0x00880000: 0x00000004, 0x00980000: 0x00000100, 0x00a80000: 0x04010000, 0x00b80000: 0x00010104,
            0x00c80000: 0x00010100, 0x00d80000: 0x04000104, 0x00e80000: 0x04010104, 0x00f80000: 0x04000000,
            0x01000000: 0x04010100, 0x01100000: 0x00010004, 0x01200000: 0x00010000, 0x01300000: 0x04000100,
            0x01400000: 0x00000100, 0x01500000: 0x04010104, 0x01600000: 0x04000004, 0x01700000: 0x00000000,
            0x01800000: 0x04000104, 0x01900000: 0x04000000, 0x01a00000: 0x00000004, 0x01b00000: 0x00010100,
            0x01c00000: 0x04010000, 0x01d00000: 0x00000104, 0x01e00000: 0x00010104, 0x01f00000: 0x04010004,
            0x01080000: 0x04000000, 0x01180000: 0x00000104, 0x01280000: 0x04010100, 0x01380000: 0x00000000,
            0x01480000: 0x00010004, 0x01580000: 0x04000100, 0x01680000: 0x00000100, 0x01780000: 0x04010004,
            0x01880000: 0x00010000, 0x01980000: 0x04010104, 0x01a80000: 0x00010104, 0x01b80000: 0x04000004,
            0x01c80000: 0x04000104, 0x01d80000: 0x04010000, 0x01e80000: 0x00000004, 0x01f80000: 0x00010100
        },
        {
            0x00000000: 0x80401000, 0x00010000: 0x80001040, 0x00020000: 0x00401040, 0x00030000: 0x80400000,
            0x00040000: 0x00000000, 0x00050000: 0x00401000, 0x00060000: 0x80000040, 0x00070000: 0x00400040,
            0x00080000: 0x80000000, 0x00090000: 0x00400000, 0x000a0000: 0x00000040, 0x000b0000: 0x80001000,
            0x000c0000: 0x80400040, 0x000d0000: 0x00001040, 0x000e0000: 0x00001000, 0x000f0000: 0x80401040,
            0x00008000: 0x80001040, 0x00018000: 0x00000040, 0x00028000: 0x80400040, 0x00038000: 0x80001000,
            0x00048000: 0x00401000, 0x00058000: 0x80401040, 0x00068000: 0x00000000, 0x00078000: 0x80400000,
            0x00088000: 0x00001000, 0x00098000: 0x80401000, 0x000a8000: 0x00400000, 0x000b8000: 0x00001040,
            0x000c8000: 0x80000000, 0x000d8000: 0x00400040, 0x000e8000: 0x00401040, 0x000f8000: 0x80000040,
            0x00100000: 0x00400040, 0x00110000: 0x00401000, 0x00120000: 0x80000040, 0x00130000: 0x00000000,
            0x00140000: 0x00001040, 0x00150000: 0x80400040, 0x00160000: 0x80401000, 0x00170000: 0x80001040,
            0x00180000: 0x80401040, 0x00190000: 0x80000000, 0x001a0000: 0x80400000, 0x001b0000: 0x00401040,
            0x001c0000: 0x80001000, 0x001d0000: 0x00400000, 0x001e0000: 0x00000040, 0x001f0000: 0x00001000,
            0x00108000: 0x80400000, 0x00118000: 0x80401040, 0x00128000: 0x00000000, 0x00138000: 0x00401000,
            0x00148000: 0x00400040, 0x00158000: 0x80000000, 0x00168000: 0x80001040, 0x00178000: 0x00000040,
            0x00188000: 0x80000040, 0x00198000: 0x00001000, 0x001a8000: 0x80001000, 0x001b8000: 0x80400040,
            0x001c8000: 0x00001040, 0x001d8000: 0x80401000, 0x001e8000: 0x00400000, 0x001f8000: 0x00401040
        },
        {
            0x00000000: 0x00000080, 0x00001000: 0x01040000, 0x00002000: 0x00040000, 0x00003000: 0x20000000,
            0x00004000: 0x20040080, 0x00005000: 0x01000080, 0x00006000: 0x21000080, 0x00007000: 0x00040080,
            0x00008000: 0x01000000, 0x00009000: 0x20040000, 0x0000a000: 0x20000080, 0x0000b000: 0x21040080,
            0x0000c000: 0x21040000, 0x0000d000: 0x00000000, 0x0000e000: 0x01040080, 0x0000f000: 0x21000000,
            0x00000800: 0x01040080, 0x00001800: 0x21000080, 0x00002800: 0x00000080, 0x00003800: 0x01040000,
            0x00004800: 0x00040000, 0x00005800: 0x20040080, 0x00006800: 0x21040000, 0x00007800: 0x20000000,
            0x00008800: 0x20040000, 0x00009800: 0x00000000, 0x0000a800: 0x21040080, 0x0000b800: 0x01000080,
            0x0000c800: 0x20000080, 0x0000d800: 0x21000000, 0x0000e800: 0x01000000, 0x0000f800: 0x00040080,
            0x00010000: 0x00040000, 0x00011000: 0x00000080, 0x00012000: 0x20000000, 0x00013000: 0x21000080,
            0x00014000: 0x01000080, 0x00015000: 0x21040000, 0x00016000: 0x20040080, 0x00017000: 0x01000000,
            0x00018000: 0x21040080, 0x00019000: 0x21000000, 0x0001a000: 0x01040000, 0x0001b000: 0x20040000,
            0x0001c000: 0x00040080, 0x0001d000: 0x20000080, 0x0001e000: 0x00000000, 0x0001f000: 0x01040080,
            0x00010800: 0x21000080, 0x00011800: 0x01000000, 0x00012800: 0x01040000, 0x00013800: 0x20040080,
            0x00014800: 0x20000000, 0x00015800: 0x01040080, 0x00016800: 0x00000080, 0x00017800: 0x21040000,
            0x00018800: 0x00040080, 0x00019800: 0x21040080, 0x0001a800: 0x00000000, 0x0001b800: 0x21000000,
            0x0001c800: 0x01000080, 0x0001d800: 0x00040000, 0x0001e800: 0x20040000, 0x0001f800: 0x20000080
        },
        {
            0x00000000: 0x10000008, 0x00000100: 0x00002000, 0x00000200: 0x10200000, 0x00000300: 0x10202008,
            0x00000400: 0x10002000, 0x00000500: 0x00200000, 0x00000600: 0x00200008, 0x00000700: 0x10000000,
            0x00000800: 0x00000000, 0x00000900: 0x10002008, 0x00000a00: 0x00202000, 0x00000b00: 0x00000008,
            0x00000c00: 0x10200008, 0x00000d00: 0x00202008, 0x00000e00: 0x00002008, 0x00000f00: 0x10202000,
            0x00000080: 0x10200000, 0x00000180: 0x10202008, 0x00000280: 0x00000008, 0x00000380: 0x00200000,
            0x00000480: 0x00202008, 0x00000580: 0x10000008, 0x00000680: 0x10002000, 0x00000780: 0x00002008,
            0x00000880: 0x00200008, 0x00000980: 0x00002000, 0x00000a80: 0x10002008, 0x00000b80: 0x10200008,
            0x00000c80: 0x00000000, 0x00000d80: 0x10202000, 0x00000e80: 0x00202000, 0x00000f80: 0x10000000,
            0x00001000: 0x10002000, 0x00001100: 0x10200008, 0x00001200: 0x10202008, 0x00001300: 0x00002008,
            0x00001400: 0x00200000, 0x00001500: 0x10000000, 0x00001600: 0x10000008, 0x00001700: 0x00202000,
            0x00001800: 0x00202008, 0x00001900: 0x00000000, 0x00001a00: 0x00000008, 0x00001b00: 0x10200000,
            0x00001c00: 0x00002000, 0x00001d00: 0x10002008, 0x00001e00: 0x10202000, 0x00001f00: 0x00200008,
            0x00001080: 0x00000008, 0x00001180: 0x00202000, 0x00001280: 0x00200000, 0x00001380: 0x10000008,
            0x00001480: 0x10002000, 0x00001580: 0x00002008, 0x00001680: 0x10202008, 0x00001780: 0x10200000,
            0x00001880: 0x10202000, 0x00001980: 0x10200008, 0x00001a80: 0x00002000, 0x00001b80: 0x00202008,
            0x00001c80: 0x00200008, 0x00001d80: 0x00000000, 0x00001e80: 0x10000000, 0x00001f80: 0x10002008
        },
        {
            0x00000000: 0x00100000, 0x00000010: 0x02000401, 0x00000020: 0x00000400, 0x00000030: 0x00100401,
            0x00000040: 0x02100401, 0x00000050: 0x00000000, 0x00000060: 0x00000001, 0x00000070: 0x02100001,
            0x00000080: 0x02000400, 0x00000090: 0x00100001, 0x000000a0: 0x02000001, 0x000000b0: 0x02100400,
            0x000000c0: 0x02100000, 0x000000d0: 0x00000401, 0x000000e0: 0x00100400, 0x000000f0: 0x02000000,
            0x00000008: 0x02100001, 0x00000018: 0x00000000, 0x00000028: 0x02000401, 0x00000038: 0x02100400,
            0x00000048: 0x00100000, 0x00000058: 0x02000001, 0x00000068: 0x02000000, 0x00000078: 0x00000401,
            0x00000088: 0x00100401, 0x00000098: 0x02000400, 0x000000a8: 0x02100000, 0x000000b8: 0x00100001,
            0x000000c8: 0x00000400, 0x000000d8: 0x02100401, 0x000000e8: 0x00000001, 0x000000f8: 0x00100400,
            0x00000100: 0x02000000, 0x00000110: 0x00100000, 0x00000120: 0x02000401, 0x00000130: 0x02100001,
            0x00000140: 0x00100001, 0x00000150: 0x02000400, 0x00000160: 0x02100400, 0x00000170: 0x00100401,
            0x00000180: 0x00000401, 0x00000190: 0x02100401, 0x000001a0: 0x00100400, 0x000001b0: 0x00000001,
            0x000001c0: 0x00000000, 0x000001d0: 0x02100000, 0x000001e0: 0x02000001, 0x000001f0: 0x00000400,
            0x00000108: 0x00100400, 0x00000118: 0x02000401, 0x00000128: 0x02100001, 0x00000138: 0x00000001,
            0x00000148: 0x02000000, 0x00000158: 0x00100000, 0x00000168: 0x00000401, 0x00000178: 0x02100400,
            0x00000188: 0x02000001, 0x00000198: 0x02100000, 0x000001a8: 0x00000000, 0x000001b8: 0x02100401,
            0x000001c8: 0x00100401, 0x000001d8: 0x00000400, 0x000001e8: 0x02000400, 0x000001f8: 0x00100001
        },
        {
            0x00000000: 0x08000820, 0x00000001: 0x00020000, 0x00000002: 0x08000000, 0x00000003: 0x00000020,
            0x00000004: 0x00020020, 0x00000005: 0x08020820, 0x00000006: 0x08020800, 0x00000007: 0x00000800,
            0x00000008: 0x08020000, 0x00000009: 0x08000800, 0x0000000a: 0x00020800, 0x0000000b: 0x08020020,
            0x0000000c: 0x00000820, 0x0000000d: 0x00000000, 0x0000000e: 0x08000020, 0x0000000f: 0x00020820,
            0x80000000: 0x00000800, 0x80000001: 0x08020820, 0x80000002: 0x08000820, 0x80000003: 0x08000000,
            0x80000004: 0x08020000, 0x80000005: 0x00020800, 0x80000006: 0x00020820, 0x80000007: 0x00000020,
            0x80000008: 0x08000020, 0x80000009: 0x00000820, 0x8000000a: 0x00020020, 0x8000000b: 0x08020800,
            0x8000000c: 0x00000000, 0x8000000d: 0x08020020, 0x8000000e: 0x08000800, 0x8000000f: 0x00020000,
            0x00000010: 0x00020820, 0x00000011: 0x08020800, 0x00000012: 0x00000020, 0x00000013: 0x00000800,
            0x00000014: 0x08000800, 0x00000015: 0x08000020, 0x00000016: 0x08020020, 0x00000017: 0x00020000,
            0x00000018: 0x00000000, 0x00000019: 0x00020020, 0x0000001a: 0x08020000, 0x0000001b: 0x08000820,
            0x0000001c: 0x08020820, 0x0000001d: 0x00020800, 0x0000001e: 0x00000820, 0x0000001f: 0x08000000,
            0x80000010: 0x00020000, 0x80000011: 0x00000800, 0x80000012: 0x08020020, 0x80000013: 0x00020820,
            0x80000014: 0x00000020, 0x80000015: 0x08020000, 0x80000016: 0x08000000, 0x80000017: 0x08000820,
            0x80000018: 0x08020820, 0x80000019: 0x08000020, 0x8000001a: 0x08000800, 0x8000001b: 0x00000000,
            0x8000001c: 0x00020800, 0x8000001d: 0x00000820, 0x8000001e: 0x00020020, 0x8000001f: 0x08020800
        }
    ];

    
    var SBOX_MASK = [
        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
    ];

    
    var DES = C_algo.DES = BlockCipher.extend({
        _doReset: function () {
            
            var key = this._key;
            var keyWords = key.words;

            
            var keyBits = [];
            for (var i = 0; i < 56; i++) {
                var keyBitPos = PC1[i] - 1;
                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
            }

            
            var subKeys = this._subKeys = [];
            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
                
                var subKey = subKeys[nSubKey] = [];

                
                var bitShift = BIT_SHIFTS[nSubKey];

                
                for (var i = 0; i < 24; i++) {
                    
                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

                    
                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
                }

                
                
                
                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
                for (var i = 1; i < 7; i++) {
                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
                }
                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
            }

            
            var invSubKeys = this._invSubKeys = [];
            for (var i = 0; i < 16; i++) {
                invSubKeys[i] = subKeys[15 - i];
            }
        },

        encryptBlock: function (M, offset) {
            this._doCryptBlock(M, offset, this._subKeys);
        },

        decryptBlock: function (M, offset) {
            this._doCryptBlock(M, offset, this._invSubKeys);
        },

        _doCryptBlock: function (M, offset, subKeys) {
            
            this._lBlock = M[offset];
            this._rBlock = M[offset + 1];

            
            exchangeLR.call(this, 4,  0x0f0f0f0f);
            exchangeLR.call(this, 16, 0x0000ffff);
            exchangeRL.call(this, 2,  0x33333333);
            exchangeRL.call(this, 8,  0x00ff00ff);
            exchangeLR.call(this, 1,  0x55555555);

            
            for (var round = 0; round < 16; round++) {
                
                var subKey = subKeys[round];
                var lBlock = this._lBlock;
                var rBlock = this._rBlock;

                
                var f = 0;
                for (var i = 0; i < 8; i++) {
                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
                }
                this._lBlock = rBlock;
                this._rBlock = lBlock ^ f;
            }

            
            var t = this._lBlock;
            this._lBlock = this._rBlock;
            this._rBlock = t;

            
            exchangeLR.call(this, 1,  0x55555555);
            exchangeRL.call(this, 8,  0x00ff00ff);
            exchangeRL.call(this, 2,  0x33333333);
            exchangeLR.call(this, 16, 0x0000ffff);
            exchangeLR.call(this, 4,  0x0f0f0f0f);

            
            M[offset] = this._lBlock;
            M[offset + 1] = this._rBlock;
        },

        keySize: 64/32,

        ivSize: 64/32,

        blockSize: 64/32
    });

    
    function exchangeLR(offset, mask) {
        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
        this._rBlock ^= t;
        this._lBlock ^= t << offset;
    }

    function exchangeRL(offset, mask) {
        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
        this._lBlock ^= t;
        this._rBlock ^= t << offset;
    }

    
    C.DES = BlockCipher._createHelper(DES);

    
    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
        _doReset: function () {
            
            var key = this._key;
            var keyWords = key.words;

            
            this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2)));
            this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4)));
            this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6)));
        },

        encryptBlock: function (M, offset) {
            this._des1.encryptBlock(M, offset);
            this._des2.decryptBlock(M, offset);
            this._des3.encryptBlock(M, offset);
        },

        decryptBlock: function (M, offset) {
            this._des3.decryptBlock(M, offset);
            this._des2.encryptBlock(M, offset);
            this._des1.decryptBlock(M, offset);
        },

        keySize: 192/32,

        ivSize: 64/32,

        blockSize: 64/32
    });

    
    C.TripleDES = BlockCipher._createHelper(TripleDES);
}());




(function (Math) {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    
    var T = [];

    
    (function () {
        for (var i = 0; i < 64; i++) {
            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
        }
    }());

    
    var MD5 = C_algo.MD5 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]);
        },

        _doProcessBlock: function (M, offset) {
            
            for (var i = 0; i < 16; i++) {
                
                var offset_i = offset + i;
                var M_offset_i = M[offset_i];

                
                M[offset_i] = (
                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
                );
            }

            
            var H = this._hash.words;

            
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];

            
            for (var i = 0; i < 64; i += 4) {
                if (i < 16) {
                    a = FF(a, b, c, d, M[offset + i],     7,  T[i]);
                    d = FF(d, a, b, c, M[offset + i + 1], 12, T[i + 1]);
                    c = FF(c, d, a, b, M[offset + i + 2], 17, T[i + 2]);
                    b = FF(b, c, d, a, M[offset + i + 3], 22, T[i + 3]);
                } else if (i < 32) {
                    a = GG(a, b, c, d, M[offset + ((i + 1) % 16)],  5,  T[i]);
                    d = GG(d, a, b, c, M[offset + ((i + 6) % 16)],  9,  T[i + 1]);
                    c = GG(c, d, a, b, M[offset + ((i + 11) % 16)], 14, T[i + 2]);
                    b = GG(b, c, d, a, M[offset + (i % 16)],        20, T[i + 3]);
                } else if (i < 48) {
                    a = HH(a, b, c, d, M[offset + ((i * 3 + 5) % 16)],  4,  T[i]);
                    d = HH(d, a, b, c, M[offset + ((i * 3 + 8) % 16)],  11, T[i + 1]);
                    c = HH(c, d, a, b, M[offset + ((i * 3 + 11) % 16)], 16, T[i + 2]);
                    b = HH(b, c, d, a, M[offset + ((i * 3 + 14) % 16)], 23, T[i + 3]);
                } else  {
                    a = II(a, b, c, d, M[offset + ((i * 3) % 16)],      6,  T[i]);
                    d = II(d, a, b, c, M[offset + ((i * 3 + 7) % 16)],  10, T[i + 1]);
                    c = II(c, d, a, b, M[offset + ((i * 3 + 14) % 16)], 15, T[i + 2]);
                    b = II(b, c, d, a, M[offset + ((i * 3 + 5) % 16)],  21, T[i + 3]);
                }
            }

            
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
        },

        _doFinalize: function () {
            
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
                (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
            );
            data.sigBytes = (dataWords.length + 1) * 4;

            
            this._process();

            
            var H = this._hash.words;

            
            for (var i = 0; i < 4; i++) {
                
                var H_i = H[i];

                
                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
            }
        }
    });

    function FF(a, b, c, d, x, s, t) {
        var n = a + ((b & c) | (~b & d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function GG(a, b, c, d, x, s, t) {
        var n = a + ((b & d) | (c & ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function HH(a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function II(a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    
    C.MD5 = Hasher._createHelper(MD5);

    
    C.HmacMD5 = Hasher._createHmacHelper(MD5);
}(Math));






(function (undefined) {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var X32WordArray = C_lib.WordArray;

    
    var C_x64 = C.x64 = {};

    
    var X64Word = C_x64.Word = Base.extend({
        
        init: function (high, low) {
            this.high = high;
            this.low = low;
        }

        
        
            
            

            
        

        
        
            
            

            
        

        
        
            
            

            
        

        
        
            
            

            
        

        
        
            
                
                
            
                
                
            

            
        

        
        
            
                
                
            
                
                
            

            
        

        
        
            
        

        
        
            
        

        
        
            
            
            

            
        
    });

    
    var X64WordArray = C_x64.WordArray = Base.extend({
        
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 8;
            }
        },

        
        toX32: function () {
            
            var x64Words = this.words;
            var x64WordsLength = x64Words.length;

            
            var x32Words = [];
            for (var i = 0; i < x64WordsLength; i++) {
                var x64Word = x64Words[i];
                x32Words.push(x64Word.high);
                x32Words.push(x64Word.low);
            }

            return X32WordArray.create(x32Words, this.sigBytes);
        },

        
        clone: function () {
            var clone = Base.clone.call(this);

            
            var words = clone.words = this.words.slice(0);

            
            var wordsLength = words.length;
            for (var i = 0; i < wordsLength; i++) {
                words[i] = words[i].clone();
            }

            return clone;
        }
    });
}());





(function () {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    
    var W = [];

    
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
        },

        _doProcessBlock: function (M, offset) {
            
            var H = this._hash.words;

            
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (n << 1) | (n >>> 31);
                }

                var t = ((a << 5) | (a >>> 27)) + e + W[i];
                if (i < 20) {
                    t += ((b & c) | (~b & d)) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                } else  {
                    t += (b ^ c ^ d) - 0x359d3e2a;
                }

                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = t;
            }

            
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
        },

        _doFinalize: function () {
            
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            
            this._process();
        }
    });

    
    C.SHA1 = Hasher._createHelper(SHA1);

    
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());


(function (Math) {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    
    var H = [];
    var K = [];

    
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    
    var W = [];

    
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            
            var H = this._hash.words;

            
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            
            this._process();
        }
    });

    
    C.SHA256 = Hasher._createHelper(SHA256);

    
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));



(function () {
    
    var C = CryptoJS;
    var C_lib = C.lib;
    var Hasher = C_lib.Hasher;
    var C_x64 = C.x64;
    var X64Word = C_x64.Word;
    var X64WordArray = C_x64.WordArray;
    var C_algo = C.algo;

    function X64Word_create() {
      return X64Word.create.apply(X64Word, arguments);
    }

    
    var K = [
        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
    ];

    
    var W = [];
    (function () {
        for (var i = 0; i < 80; i++) {
            W[i] = X64Word_create();
        }
    }());

    
    var SHA512 = C_algo.SHA512 = Hasher.extend({
        _doReset: function () {
            this._hash = X64WordArray.create([
                X64Word_create(0x6a09e667, 0xf3bcc908), X64Word_create(0xbb67ae85, 0x84caa73b),
                X64Word_create(0x3c6ef372, 0xfe94f82b), X64Word_create(0xa54ff53a, 0x5f1d36f1),
                X64Word_create(0x510e527f, 0xade682d1), X64Word_create(0x9b05688c, 0x2b3e6c1f),
                X64Word_create(0x1f83d9ab, 0xfb41bd6b), X64Word_create(0x5be0cd19, 0x137e2179)
            ]);
        },

        _doProcessBlock: function (M, offset) {
            
            var H = this._hash.words;

            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];

            var H0h = H0.high;
            var H0l = H0.low;
            var H1h = H1.high;
            var H1l = H1.low;
            var H2h = H2.high;
            var H2l = H2.low;
            var H3h = H3.high;
            var H3l = H3.low;
            var H4h = H4.high;
            var H4l = H4.low;
            var H5h = H5.high;
            var H5l = H5.low;
            var H6h = H6.high;
            var H6l = H6.low;
            var H7h = H7.high;
            var H7l = H7.low;

            
            var ah = H0h;
            var al = H0l;
            var bh = H1h;
            var bl = H1l;
            var ch = H2h;
            var cl = H2l;
            var dh = H3h;
            var dl = H3l;
            var eh = H4h;
            var el = H4l;
            var fh = H5h;
            var fl = H5l;
            var gh = H6h;
            var gl = H6l;
            var hh = H7h;
            var hl = H7l;

            
            for (var i = 0; i < 80; i++) {
                
                var Wi = W[i];

                
                if (i < 16) {
                    var Wih = Wi.high = M[offset + i * 2]     | 0;
                    var Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
                } else {
                    
                    var gamma0x  = W[i - 15];
                    var gamma0xh = gamma0x.high;
                    var gamma0xl = gamma0x.low;
                    var gamma0h  = ((gamma0xl << 31) | (gamma0xh >>> 1)) ^ ((gamma0xl << 24) | (gamma0xh >>> 8)) ^ (gamma0xh >>> 7);
                    var gamma0l  = ((gamma0xh << 31) | (gamma0xl >>> 1)) ^ ((gamma0xh << 24) | (gamma0xl >>> 8)) ^ ((gamma0xh << 25) | (gamma0xl >>> 7));

                    
                    var gamma1x  = W[i - 2];
                    var gamma1xh = gamma1x.high;
                    var gamma1xl = gamma1x.low;
                    var gamma1h  = ((gamma1xl << 13) | (gamma1xh >>> 19)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
                    var gamma1l  = ((gamma1xh << 13) | (gamma1xl >>> 19)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xh << 26) | (gamma1xl >>> 6));

                    
                    var Wi7  = W[i - 7];
                    var Wi7h = Wi7.high;
                    var Wi7l = Wi7.low;

                    var Wi16  = W[i - 16];
                    var Wi16h = Wi16.high;
                    var Wi16l = Wi16.low;

                    
                    var Wil = gamma0l + Wi7l;
                    var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
                    var Wil = Wil + gamma1l;
                    var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
                    var Wil = Wil + Wi16l;
                    var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

                    Wi.high = Wih;
                    Wi.low  = Wil;
                }

                
                var chh  = (eh & fh) ^ (~eh & gh);
                var chl  = (el & fl) ^ (~el & gl);

                
                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

                
                var sigma0h = ((al << 4) | (ah >>> 28)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
                var sigma0l = ((ah << 4) | (al >>> 28)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));

                
                var sigma1h = ((el << 18) | (eh >>> 14)) ^ ((el << 14) | (eh >>> 18)) ^ ((eh << 23) | (el >>> 9));
                var sigma1l = ((eh << 18) | (el >>> 14)) ^ ((eh << 14) | (el >>> 18)) ^ ((el << 23) | (eh >>> 9));

                
                var Ki  = K[i];
                var Kih = Ki.high;
                var Kil = Ki.low;

                
                var t1l = hl + sigma1l;
                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
                var t1l = t1l + chl;
                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
                var t1l = t1l + Kil;
                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
                var t1l = t1l + Wil;
                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

                
                var t2l = sigma0l + majl;
                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

                
                hh = gh;
                hl = gl;
                gh = fh;
                gl = fl;
                fh = eh;
                fl = el;
                el = (dl + t1l) | 0;
                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
                dh = ch;
                dl = cl;
                ch = bh;
                cl = bl;
                bh = ah;
                bl = al;
                al = (t1l + t2l) | 0;
                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
            }

            
            H0l = H0.low = (H0l + al) | 0;
            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0)) | 0;
            H1l = H1.low = (H1l + bl) | 0;
            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0)) | 0;
            H2l = H2.low = (H2l + cl) | 0;
            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0)) | 0;
            H3l = H3.low = (H3l + dl) | 0;
            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
            H4l = H4.low = (H4l + el) | 0;
            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0)) | 0;
            H5l = H5.low = (H5l + fl) | 0;
            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0)) | 0;
            H6l = H6.low = (H6l + gl) | 0;
            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0)) | 0;
            H7l = H7.low = (H7l + hl) | 0;
            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0)) | 0;
        },

        _doFinalize: function () {
            
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            
            this._process();

            
            this._hash = this._hash.toX32();
        },

        blockSize: 1024/32
    });

    
    C.SHA512 = Hasher._createHelper(SHA512);

    
    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
}());



CryptoJS.mode.CFB = (function () {
    var CFB = CryptoJS.lib.BlockCipherMode.extend();

    CFB.Encryptor = CFB.extend({
        processBlock: function (words, offset) {
            
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;

            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

            
            this._prevBlock = words.slice(offset, offset + blockSize);
        }
    });

    CFB.Decryptor = CFB.extend({
        processBlock: function (words, offset) {
            
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;

            
            var thisBlock = words.slice(offset, offset + blockSize);

            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

            
            this._prevBlock = thisBlock;
        }
    });

    function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
        
        var iv = this._iv;

        
        if (iv) {
            var keystream = iv.slice(0);

            
            this._iv = undefined;
        } else {
            var keystream = this._prevBlock;
        }
        cipher.encryptBlock(keystream, 0);

        
        for (var i = 0; i < blockSize; i++) {
            words[offset + i] ^= keystream[i];
        }
    }

    return CFB;
}());


CryptoJS.mode.ECB = (function () {
    var ECB = CryptoJS.lib.BlockCipherMode.extend();

    ECB.Encryptor = ECB.extend({
        processBlock: function (words, offset) {
            this._cipher.encryptBlock(words, offset);
        }
    });

    ECB.Decryptor = ECB.extend({
        processBlock: function (words, offset) {
            this._cipher.decryptBlock(words, offset);
        }
    });

    return ECB;
}());


CryptoJS.mode.OFB = (function () {
    var OFB = CryptoJS.lib.BlockCipherMode.extend();

    var Encryptor = OFB.Encryptor = OFB.extend({
        processBlock: function (words, offset) {
            
            var cipher = this._cipher
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var keystream = this._keystream;

            
            if (iv) {
                keystream = this._keystream = iv.slice(0);

                
                this._iv = undefined;
            }
            cipher.encryptBlock(keystream, 0);

            
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= keystream[i];
            }
        }
    });

    OFB.Decryptor = Encryptor;

    return OFB;
}());

CryptoJS.mode.CTR = (function () {
    var CTR = CryptoJS.lib.BlockCipherMode.extend();

    var Encryptor = CTR.Encryptor = CTR.extend({
        processBlock: function (words, offset) {
            
            var cipher = this._cipher
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;

            
            if (iv) {
                counter = this._counter = iv.slice(0);

                
                this._iv = undefined;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);

            
            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0

            
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= keystream[i];
            }
        }
    });

    CTR.Decryptor = Encryptor;

    return CTR;
}());



CryptoJS.pad.ZeroPadding = {
    pad: function (data, blockSize) {
        
        var blockSizeBytes = blockSize * 4;

        
        data.clamp();
        data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
    },

    unpad: function (data) {
        
        var dataWords = data.words;

        
        var i = data.sigBytes - 1;
        while (!((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
            i--;
        }
        data.sigBytes = i + 1;
    }
};





CryptoJS.pad.NoPadding = {
    pad: function () {
    },

    unpad: function () {
    }
};


CryptoJS.pad.Iso97971 = {
    pad: function (data, blockSize) {
        
        data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

        
        CryptoJS.pad.ZeroPadding.pad(data, blockSize);
    },

    unpad: function (data) {
        
        CryptoJS.pad.ZeroPadding.unpad(data);

        
        data.sigBytes--;
    }
};



CryptoJS.pad.Iso10126 = {
    pad: function (data, blockSize) {
        
        var blockSizeBytes = blockSize * 4;

        
        var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

        
        data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
             concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
    },

    unpad: function (data) {
        
        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

        
        data.sigBytes -= nPaddingBytes;
    }
};

