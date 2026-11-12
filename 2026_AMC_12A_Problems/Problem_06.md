# 2026 AMC 12A Problem 6

> This problem is the same as [2026 AMC 10A #10](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_10) and [2026 AMC 12A #6](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_6).

## Problem
For what odd positive integer $n$ is the mean of $1$, $4$, $9$, $16$, $\dots$, $n^{2}$ exactly $32\%$ greater than its median?

$\textbf{(A)}\   19  \qquad 	\textbf{(B)}\   39  \qquad 	\textbf{(C)}\   49  \qquad 	\textbf{(D)}\   89  \qquad 	\textbf{(E)}\   169$

## Solution 1
Since all answer choices are odd, the median of the sequence is 


$$
\left(\frac{n+1}{2}\right)^2
$$



The mean of the sequence is


$$
\frac{1}{n}\sum_{k=1}^{n} k^2 = \frac{1}{n}\cdot\frac{n(n+1)(2n+1)}{6} = \frac{(n+1)(2n+1)}{6}
$$



Since the mean is $32\%$ greater than the median, we have


$$
\frac{(n+1)(2n+1)}{6} = \frac{132}{100}\left(\frac{n+1}{2}\right)^2
$$




$$
200n + 100 = 198n + 198
$$




$$
n = \boxed{\textbf{(C) } 49}
$$



~[Logibyte](https://artofproblemsolving.com/wiki/index.php/Logibyte)

## Solution 2 (Divisibility, Answer choices)
As established in Solution 1, we have the mean and median. Now we write the ratio of of mean to median:


$$
\frac{\text{Mean}}{\text{Median}} = \frac{\frac{(n+1)(2n+1)}{6}}{\frac{(n+1)^2}{4}} = \frac{2(2n+1)}{3(n+1)} = \frac{4n+2}{3n+3}
$$



We are given that this ratio is exactly $32\%$ greater than $1$, which means:


$$
\frac{4n+2}{3n+3}=\frac{132}{100} = \frac{33}{25}
$$



Note that the fraction $\frac{33}{25}$ is in simplest form. For the denominator $3(n+1)$ to reduce to a multiple of $25$ after canceling out any common factors with the numerator, $n+1$ must be a multiple of $25$.

We test the given answer choices for $n+1$:
- (A) $19 + 1 = 20$ (not a multiple of 25)
- (B) $39 + 1 = 40$ (not a multiple of 25)
- (C) $49 + 1 = 50$ (multiple of 25)
- (D) $89 + 1 = 90$ (not a multiple of 25)
- (E) $169 + 1 = 170$ (not a multiple of 25)

Only $n = 49$ satisfies.



$$
n = \boxed{\textbf{(C) } 49}
$$



~[Icosahedron0288](https://artofproblemsolving.com/wiki/index.php/User：Icosahedron0288#Created_Pages)

~Minor edits by Calvin67

## Solution 3
Let $n=2k-1.$ The median of the sequence would then be $k^2,$ while the mean would be $\frac{1^2+2^2+3^2+...+(2k-1)^2}{2k-1}=\frac{(2k-1)(2k)(4k-1)}{6(2k-1)}=\frac{(k)(4k-1)}{3}.$ 

Equating, we get $\frac{(k)(4k-1)}{3}=1.32(k^2)\implies 4k-1=3.96k\implies k=25\implies n=\boxed{\text{(C) }49}$ ~Tacos_are_yummy_1
~Minor Edits by Horseneck3

## Video Solution 1 by MathIsFun
https://youtu.be/JRWnRtZNW9o?si=Pf0Lz9pvz6wwnbuX&t=5

## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
