# 2006 AMC 12A Problem 23

## Problem
Given a finite sequence S=($a_1,a_2,\ldots$ ,$a_n$) of n real numbers, let A(S) be the sequence
$$\left(\frac{a_1+a_2}{2},\frac{a_2+a_3}{2},\ldots ,\frac{a_{n-1}+a_n}{2}\right)$$
of $n-1$ real numbers. Define $A^1(S)$=A(S) and, for each integer m, $2\lem\len-1$, define $A^m(S)=A(A^{m-1}(S))$. Suppose x>0, and let $S=(1,x,x^2,\ldots$ ,$x^{100}). If A^{100}(S)=(1/2^{50}$), then what is x?


$$\mathrm{(A) \ } 1-\frac{\sqrt{2}}{2}\qquad \mathrm{(B) \ } \sqrt{2}-1\qquad \mathrm{(C) \ } \frac{1}{2}\qquad \mathrm{(D) \ } 2-\sqrt{2}\qquad \mathrm{(E) \ } \frac{\sqrt{2}}{2}$$

## Solution 1

$$
A^1(S)=\left(\frac{1+x}{2},\frac{x+x^2}{2},...,\frac{x^{99}+x^{100}}{2}\right)
A^2(S)=\left(\frac{1+2x+x^2}{2^2},\frac{x+2x^2+x^3}{2^2},...,\frac{x^{98}+2x^{99}+x^{100}}{2^2}\right)
\Rightarrow A^2(S)=\left(\frac{(x+1)^2}{2^2},\frac{x(x+1)^2}{2^2},...,\frac{x^{98}(x+1)^2}{2^2}\right)
$$


In general, A^n(S)=$\left(\frac{(x+1)^n}{2^n},\frac{x(x+1)^n}{2^n},...,\frac{x^{100-n}(x+1)^n}{2^n}\right)$ such that $A^n(s)$ has 101-n terms. Specifically, $A^{100}(S)=\frac{(x+1)^{100}}{2^{100}}$ To find x, we need only solve the equation $\frac{(x+1)^{100}}{2^{100}}=\frac{1}{2^{50}}.$ Algebra yields $x=\sqrt{2}-1.$
## Solution 2
For every sequence S=$\left(a_1,a_2,\dots,a_n\right)$ of at least three terms,

$A^2(S)=\left(\frac{a_1+2a_2+a_3}{4},\frac{a_2+2a_3+a_4}{4},\dots,\frac{a_{n-2}+2a_{n-1}+a_n}{4}\right).$Thus for $m =1\text{ and }2,$ the coefficients of the terms in the numerator of $A^m(S)$ are the binomial coefficients $\binom{m}{0},\binom{m}{1},\dots,\binom{m}{m},$ and the denominator is 2^m. Because $\binom{m}{r}+\binom{m}{r+1}=\binom{m+1}{r+1}$ for all integers $r\geq 0,$ the coefficients of the terms in the numerators of $A^{m+1}(S)$ are $\binom{m+1}{0},\binom{m+1}{1},\ldots,\binom{m+1}{m+1}$ for $2\leqm\leqn-2$. The definition implies that the denominator of each term in $A^{m+1}(S)$ is $2^{m+1}$. For the given sequence, the sole term in $A^{100}(S)$ is $\frac{1}{2^{100}} \sum_{m=0}^{100} \binom{100}{m}a_{m+1}=\frac{1}{2^{100}} \sum_{m=0}^{100} \binom{100}{m}x^m =\frac{1}{2^{100}}(x+1)^{100}.$Therefore,  $\left(\frac{1}{2^{50}}\right)=A^{100}(S)=\left(\frac{(1+x)^{100}}{2^{100}}\right),$ so (1+$x)^{100}=2^{50}$, and because x>0, we have $x=\boxed{\sqrt{2}-1}.$
- Alcumus
## See also
