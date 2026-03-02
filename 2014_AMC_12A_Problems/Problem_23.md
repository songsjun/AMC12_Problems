# 2014 AMC 12A Problem 23

## Problem
The fraction

$$\dfrac1{99^2}=0.\overline{b_{n-1}b_{n-2}\ldots b_2b_1b_0},$$

where n is the length of the period of the repeating decimal expansion.  What is the sum $b_$0+b_$1+\cdots+b_{n-1}$?

$\textbf{(A) }874\qquad \textbf{(B) }883\qquad \textbf{(C) }887\qquad \textbf{(D) }891\qquad \textbf{(E) }892\qquad$
## Solution 1
the fraction $\dfrac{1}{99}$ can be written as $\sum^{\infty}_{n=1}\dfrac{1}{10^{2n}}.$
similarly the fraction $\dfrac{1}{99^2}$ can be written as $\sum^{\infty}_{m=1}\dfrac{1}{10^{2m}}\sum^{\infty}_{n=1}\dfrac{1}{10^{2n}}$ which is equivalent to $\sum^{\infty}_{m=1}\sum^{\infty}_{n=1} \dfrac{1}{10^{2(m+n)}}$
and we can see that for each n+m=k there are $k-1$   (n,m) combinations so the above sum is equivalent to:
$$\sum^{\infty}_{k=2}\dfrac{k-1}{10^{2k}}$$
we note that the sequence starts repeating at $k = 102$
yet consider $\sum^{101}_{k=99}\dfrac{k-1}{10^{2k}}=\dfrac{98}$}+$\dfrac{99}$}+$\dfrac{100}{10^}=\dfrac{1}{10^{198}}(98+\dfrac{99}{100}+\dfrac{100}{10000})=\dfrac{1}{10^{198}}(98+\dfrac{99}{100}+\dfrac{1}{100})=\dfrac{1}{10^{198}}(98+\dfrac{100}{100})=\dfrac{1}{10^{198}}(99)$
so the decimal will go from 1 to 99 skipping the number 98
and we can easily compute the sum of the digits from 0 to 99 to be $45\cdot10\cdot2=900$ subtracting the sum of the digits of 98 which is 17 we get
$$900-17=883\textbf{(B) }\qquad$$
## Solution 2

$$\frac{1}{99^2}\\\\ =\frac{1}{99} \cdot \frac{1}{99}\\\\ =\frac{0.\overline{01}}{99}\\\\ =0.\overline{00010203...9799}$$


So, the answer is $0+0+0+1+0+2+0+3+...+9+7+9+9=2\cdot10\cdot\frac{9\cdot10}{2}-(9+8)$ or $\boxed{\textbf{(B)}\ 883}.$

There are two things to notice here. First, $\frac{1}{99}$ has a very simple and unique decimal expansion, as shown. Second, for $\frac{0.\overline{01}}{99}$ to itself produce a repeating decimal, 99 has to evenly divide a sufficiently extended number of the form 101010101... This number will have 99 ones (197 digits in total), as to be divisible by 9 and 11. The enormity of this number forces us to look for a pattern, and so we divide out as shown. Indeed, upon division (seeing how the remainders always end in "501" or "601" or, at last, "9801"), we find the repeating part .00010203040506070809101112131415....9799. If we wanted to further check our pattern, we could count the total number of digits in our quotient (not counting the first three): 195. Since $99<100$, multiplying by it will produce either 1 or 2 extra digits, so our quotient passes the test.

Or note that the 1 has to be carried when you get to 100 so the 99 becomes 00 and the 1 gets carried again to 98 which becomes 99.
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2014amc12a/382
## See Also
