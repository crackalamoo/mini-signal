function expMod(base, exp, mod) {
    // return base^exp mod (`mod`)
    if (exp == 0)
        return 1;
    if (exp % 2 == 0)
        return Math.pow(expMod(base, (exp / 2), mod), 2) % mod;
    return (base * expMod(base, (exp - 1), mod)) % mod;
}
function randomPrime(minVal, range) {
    // return a random prime in the range [minVal, minVal + range)
    const isPrime = (num) => {
        for (let i = 2, s = Math.sqrt(num); i <= s; i++)
            if (num % i === 0) return false;
        return num > 1;
    }
    let res = 1;
    while (!isPrime(res))
        res = minVal + Math.floor(Math.random() * range);
    return res;
}
function gcd(a, b) {
    /* extended Euclidean algorithm: return the gcd of a and b (first item) plus 
    intermediate results used to calculate the modular multiplicative inverse */
    if (b === 0)
        return [a, 1, 0];
    const [g, x, y] = gcd(b, a % b);
    return [g, y, x - Math.floor(a/b) * y];
}
const modInv = (a, m) => ((gcd(a,m)[1] % m + m) % m); // modular multiplicative inverse

function randomCoprime(coprimeTo, range) {
    // returns a random number in the range [2, 2+range) that is coprime to `coprimeTo`
    let res = coprimeTo;
    while (gcd(res, coprimeTo)[0] !== 1)
        res = 2 + Math.floor(Math.random() * range);
    return res;
}

async function sha256(message, mod) {
    // returns the SHA256 hash of `message` as a number mod `mod`
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    let hash = 0;
    for (let i = 0; i < hashArray.length; i++) {
        hash += Math.pow(256, i) * hashArray[hashArray.length-i-1];
        hash %= mod;
    }
    return hash;
}