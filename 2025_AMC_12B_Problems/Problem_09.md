# 2025 AMC 12B Problem 9

## Problem
What is the tens digit of $6^{6^6}$?

$\textbf{(A)}~1 \qquad \textbf{(B)}~3 \qquad \textbf{(C)}~5 \qquad \textbf{(D)}~7 \qquad \textbf{(E)}~9$
## Solution 1
We wish to find $6^{6^6}\pmod{100}$ and find the tens digit. By the Chinese Remainder Theorem, it suffices to find $6^{6^6}\pmod{4}$ and $6^{6^6}\pmod{25}$ and find the solution to the system. We know that $6^{6^6}\equiv 0\pmod{4},$ so we just need to find the remainder modulo 25.

By Euler’s Totient Theorem, $6^{6^6}\equiv 6^r\pmod{25},$ where $r\equiv 6^6\pmod{\varphi(25)=20}.$ Hence we need to find $6^6\pmod{20}.$

Now we again use the Chinese Remainder Theorem. We know that $6^6\equiv 0\pmod{4}$ and $6^6\equiv 1^6\equiv 1\pmod{5}.$ Testing cases yields $6^6\equiv 16\pmod{20}.$

Therefore, we know that $6^{6^6}\equiv 6^{16}\pmod{25}.$ Now we can simplify:

$$6^{6^6}\equiv 6^{16}\equiv (6^4)^4\equiv 1296^4\equiv (-4)^4\equiv 256\equiv 6\pmod{25}$$

Solving the system $6^{6^6}\equiv 6\pmod{25}$ and $6^{6^6}\equiv 0\pmod{4}$ yields $6^{6^6}\equiv 56\pmod{100}.$ Hence the answer is $\boxed{\textbf{(C)}~5}.$

~ [https://artofproblemsolving.com/wiki/index.php/User:Eevee9406 eevee9406]
## Solution 2
$$6^{6^6} = 6^{46656}$$
Now, listing out the first few values of the rightmost two digits for power of 6, we get

06, 36, 16, 96, 76, 56, 36, 16, 96, 76, 56, 36...

Now, note that the pattern starting from at $6^2$ will continue. Treating the first as a 56 since it won't matter for the result, the pattern turns to 56 every n such that $n=1+5k$, where k is a non-negative integer. So, since 46656 = 1 + $5(9331)$, it will have 56 as its rightmost 2 numbers, giving the answer $\boxed{\textbf{(C)}~5}.$

*~Failure.net (minor latex edit by Voidling)*
## Solution 3 (Fast)
Trying the first few powers of 6 gives a pattern with period 5:

$$06, 36, 16, 96, 76, 56, 36, \dots \Rightarrow 0, 3, 1, 9, 7, 5, 3, \dots$$
Notice any power of 6 has a units digit 6. Then 6^6 $\equiv 1 \mod{5}$ and the answer is $\boxed{\textbf{(C)}~5} (6^1$'s tens digit is 0 and for all $6^{1+5n}$ for any n $\geq 1$ its tens digit is 5 according to our pattern).

*~Pearl2008*
## See Also
