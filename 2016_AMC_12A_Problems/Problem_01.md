# 2016 AMC 12A Problem 1

## Problem
What is the value of $\dfrac{11!-10!}{9!}$?

$\textbf{(A)}\ 99\qquad\textbf{(B)}\ 100\qquad\textbf{(C)}\ 110\qquad\textbf{(D)}\ 121\qquad\textbf{(E)}\ 132$
## Solution 1
We can use subtraction of fractions to get

$$\frac{11!-10!}{9!} = \frac{11!}{9!} - \frac{10!}{9!} = 110 -10 = \boxed{\textbf{(B)}\;100}.$$
## Solution 2
Factoring out $9!$ gives $\frac{11!-10!}{9!} = \frac{9!(11 \cdot 10 - 10)}{9!} = 110-10=\boxed{\textbf{(B)}~100}$.
## Solution 3
$\dfrac{11!-10!}{9!}$
consider 10 as n
$\dfrac{(n+1)!-n!}{(n-1)!}$
simpify
$\dfrac{(n+1)n!+(-1)n!}{(n-1)!}$ = $\dfrac{n(n!)}{(n-1)!}$ = $\dfrac{n(n(n-1)!)}{(n-1)!}$ = $\dfrac{n(n)(1)}{1}$ = $\dfrac{n^2}{1}$
subsitute n as 10 again
$\dfrac{10^2}{1}$

answer is $10^2$ which is $\boxed{\textbf{(B)}~100}$.
## Solution 4
We are given the equation $\frac{11!-10!}{9!}$

This is equivalent to $\frac{11(10!) - 1(10!)}{9!}$
Simplifying, we get $\frac{(11-1)(10!)}{9!}$, which equals $10 \cdot 10$.

Therefore, the answer is $10^2=\boxed{\textbf{(B)}~100}$.

*~TheGoldenRetriever*
## Solution 5 (This is a joke)
Let


$$I_n := \int_0^\infty x^n e^{-x} \, dx = n!$$


(the Gamma–integral).

Then


$$\frac{11! - 10!}{9!} = \frac{I_{11} - I_{10}}{I_9} = \frac{\int_0^\infty e^{-x} (x^{11} - x^{10}) \, dx}{I_9}.$$


Integration by parts on the numerator with $u = x^{11} - x^{10}$, $dv = e^{-x} \, dx$ (so $du = (11x^{10} - 10x^9) \, dx$, $v = -e^{-x}$) gives


$$\int_0^\infty e^{-x} (x^{11} - x^{10}) \, dx = \left[ -e^{-x} (x^{11} - x^{10}) \right]_0^\infty + \int_0^\infty e^{-x} (11x^{10} - 10x^9) \, dx = 11 I_{10} - 10 I_9,$$


since the boundary term vanishes.

Hence


$$\frac{I_{11} - I_{10}}{I_9} = \frac{11 I_{10}}{I_9} - 10.$$


Do another integration by parts to relate $I_{10}$ and $I_9$:


$$I_{10} = \int_0^\infty x^{10} e^{-x} \, dx = \left[ -x^{10} e^{-x} \right]_0^\infty + 10 \int_0^\infty x^9 e^{-x} \, dx = 10 I_9.$$


Therefore


$$\frac{I_{11} - I_{10}}{I_9} = 11 \cdot 10 - 10 = 100.$$


$\boxed{(B) 100}$.

*~Pinotation*

*~Minorly Edited by OffBrandCab*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/r5G98oPPyNM

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/VIt6LnkV4_w


https://youtu.be/CrS7oHDrvP8

*~savannahsolver*
## Video Solution (FASTEST METHOD!)
https://youtu.be/jowREGsZaTs

*~Veer Mahajan*
## See Also
