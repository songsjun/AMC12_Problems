# 2015 AMC 12A Problem 15

## Problem
What is the minimum number of digits to the right of the decimal point needed to express the fraction $\frac{123456789}{2^{26}\cdot 5^4}$ as a decimal?

$\textbf{(A)}\ 4\qquad\textbf{(B)}\ 22\qquad\textbf{(C)}\ 26\qquad\textbf{(D)}\ 30\qquad\textbf{(E)}\ 104$
## Solution 2
Multiply the numerator and denominator of the fraction by $5^{22}$ (which is the same as multiplying by 1) to give $\frac{5^{22} \cdot 123456789}{10^{26}}.$ Now, instead of thinking about this as a fraction, think of it as the division calculation ($5^{22}\cdot 123456789) \div 10^{26}$ . The dividend is a huge number, but we know it doesn't have any digits to the right of the decimal point. Also, the dividend is not a multiple of 10 (it's not a multiple of 2), so these 26 divisions by 10 will each shift the entire dividend one digit to the right of the decimal point. Thus,
$\boxed{\textbf{(C)}\ 26}$ is the minimum number of digits to the right of the decimal point needed.
## Solution 3
The denominator is $10^4 \cdot 2^{22}.$ Each 10 adds one digit to the right of the decimal, and each additional 2 adds another digit. The answer is 4 + 22 = $\boxed{\textbf{(C)}\ 26}.$
## Solution 4 (for those like myself who couldn't think of something smarter to do)
First, we can write the denominator as $2^{22}\cdot 10^4$ and forget about the 10^4 (however, we will need to add 4 back to our final answer). Noticing that $2^{22}=\left(2^{11} \right)^2=2048^2,$ we divide 123456789 by 2048 using long division. We get 60281.63525390625 as the result (though the process seems intimidating, it actually doesn't take that long, just a couple of minutes). From there, we notice that there are 11 places after the decimal point in the quotient, which means there will be another 11 after we divide this quotient by 2048 again. So, there will be 22 places after the decimal in the final quotient. We add back 4 for a total of 26.
## Solution 5 (Quick and logical)
This problem becomes substantially easier if our denominator is a power of ten. Notice that:
$$\frac{123456789}{2^{26}*5^{4}}=\frac{5^{22}*123456789}{10^{26}}.$$
This means we have 26 places after the decimal place to work with. If our numerator has at most 26 places, nothing will "spill over" into the integer side. You can see this via scientific notation. (You can easily stop here because it is rather obvious that the numerator is far smaller than the denominator, so we will have something like 23 digits after the decimal point). For the sake of rigor, we will confirm our suspicious that we will have 26 places.
\newline Let D(n) be the number of digits of n. it is well known that D(n)$\lfloor$ log(n)$\rfloor+1.$ You can see this as the $\lfloor$ log(n)$\rfloor$ is the largest power of 10 less than $n. 10^n$ has $n+1$ digits so since $n\geq \lfloor$ n $\rfloor,$ it will also have $n+1$ digits.
\newline Thus:

$$D(5^{22}*123456789)=\lfloor log(5^{22}*123456789)\rfloor+1 = \lfloor 22log(5)+log(123456789)\rfloor+1\approx\lfloor 22 * 0.7 + 8.1 \rfloor+1 \approx \lfloor 15.4+8.1 \rfloor +1 = 23+1 = 24$$

\newline Since $24<26$ we will have no spill over. We will also have 2 zeros in front of a 24 digit number.
Thus, our result is $\boxed{\textbf{(C) }26}$
*~Stereotypicalmathnerd*
## See Also
