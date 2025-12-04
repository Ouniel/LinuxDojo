/**
 * openssl - OpenSSL 命令行工具
 */

export const openssl = {
    name: 'openssl',
    description: 'OpenSSL command line tool|OpenSSL 命令行工具',

    handler: (args, context) => {
        if (args.length === 0 || args.includes('help')) {
            return openssl.help
        }

        const command = args[0]
        let output = []

        switch (command) {
            case 'version':
                return 'OpenSSL 1.1.1f  31 Mar 2020'

            case 'genrsa':
                output.push('Generating RSA private key, 2048 bit long modulus (2 primes)')
                output.push('................+++++')
                output.push('................................................................................................+++++')
                output.push('e is 65537 (0x010001)')
                output.push('-----BEGIN RSA PRIVATE KEY-----')
                output.push('MIIEowIBAAKCAQEA...')
                output.push('(Simulated Private Key Content)')
                output.push('-----END RSA PRIVATE KEY-----')
                break

            case 'req':
                if (args.includes('-new')) {
                    output.push('Generating a RSA private key')
                    output.push('................+++++')
                    output.push('writing new private key to \'privkey.pem\'')
                    output.push('-----')
                    output.push('You are about to be asked to enter information that will be incorporated')
                    output.push('into your certificate request.')
                    output.push('-----')
                    output.push('Country Name (2 letter code) [AU]:')
                }
                break

            case 'x509':
                if (args.includes('-in') && args.includes('-text')) {
                    output.push('Certificate:')
                    output.push('    Data:')
                    output.push('        Version: 3 (0x2)')
                    output.push('        Serial Number:')
                    output.push('            12:34:56:78:90:ab:cd:ef')
                    output.push('    Signature Algorithm: sha256WithRSAEncryption')
                    output.push('        Issuer: C=US, ST=California, L=San Francisco, O=My Company, CN=example.com')
                }
                break

            case 'enc':
                output.push('(Simulated encryption/decryption output)')
                break

            default:
                output.push(`openssl:Error: '${command}' is an invalid command.`)
                output.push('')
                output.push('Standard commands')
                output.push('asn1parse         ca                ciphers           cms')
                output.push('crl               crl2pkcs7         dgst              dhparam')
                output.push('dsa               dsaparam          ec                ecparam')
                output.push('enc               engine            errstr            gendsa')
                output.push('genpkey           genrsa            help              list')
                output.push('nseq              ocsp              passwd            pkcs12')
                output.push('pkcs7             pkcs8             pkey              pkeyparam')
                output.push('pkeyutl           prime             rand              rehash')
                output.push('req               rsa               rsautl            s_client')
                output.push('s_server          s_time            sess_id           smime')
                output.push('speed             spkac             srp               storeutl')
                output.push('ts                verify            version           x509')
        }

        return output.join('\n')
    },

    options: [
        {
            name: 'command',
            type: 'select',
            description: 'Command',
            options: ['genrsa', 'req', 'x509', 'enc', 'dgst', 's_client', 'version'],
            default: 'version',
            inputKey: 'subcommand'
        },
        {
            name: 'genrsa_options',
            type: 'group',
            description: 'genrsa Options',
            options: [
                {
                    name: '-out',
                    flag: '-out',
                    type: 'input',
                    description: 'Output file',
                    placeholder: 'filename'
                },
                {
                    name: 'numbits',
                    type: 'input',
                    description: 'Number of bits',
                    placeholder: '2048',
                    inputKey: 'numbits'
                }
            ]
        },
        {
            name: 'req_options',
            type: 'group',
            description: 'req Options',
            options: [
                {
                    name: '-new',
                    flag: '-new',
                    type: 'boolean',
                    description: 'New request'
                },
                {
                    name: '-x509',
                    flag: '-x509',
                    type: 'boolean',
                    description: 'Output a x509 structure instead of a cert. req.'
                },
                {
                    name: '-key',
                    flag: '-key',
                    type: 'input',
                    description: 'Private key to use',
                    placeholder: 'filename'
                }
            ]
        }
    ],
    help: `OpenSSL 1.1.1f  31 Mar 2020

Standard commands
asn1parse         ca                ciphers           cms
crl               crl2pkcs7         dgst              dhparam
dsa               dsaparam          ec                ecparam
enc               engine            errstr            gendsa
genpkey           genrsa            help              list
nseq              ocsp              passwd            pkcs12
pkcs7             pkcs8             pkey              pkeyparam
pkeyutl           prime             rand              rehash
req               rsa               rsautl            s_client
s_server          s_time            sess_id           smime
speed             spkac             srp               storeutl
ts                verify            version           x509

Message Digest commands (see the dgst command for more details)
blake2b512        blake2s256        gost              md4
md5               rmd160            sha1              sha224
sha256            sha3-224          sha3-256          sha3-384
sha3-512          sha384            sha512            sha512-224
sha512-256        shake128          shake256          sm3

Cipher commands (see the enc command for more details)
aes-128-cbc       aes-128-ecb       aes-192-cbc       aes-192-ecb
aes-256-cbc       aes-256-ecb       aria-128-cbc      aria-128-cfb
...`
}
