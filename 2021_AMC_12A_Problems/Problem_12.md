# 2021 AMC 12A Problem 12

> This problem is the same as [2021 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_12) and [2021 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_14).
## Problem
All the roots of the polynomial $z^6-10z^5+Az^4+Bz^3+Cz^2+Dz+16$ are positive integers, possibly repeated. What is the value of B?

$\textbf{(A) }{-}88 \qquad \textbf{(B) }{-}80 \qquad \textbf{(C) }{-}64 \qquad \textbf{(D) }{-}41\qquad \textbf{(E) }{-}40$
## Solution 1
By Vieta's formulas, the sum of the six roots is 10 and the product of the six roots is 16. By inspection, we see the roots are 1, 1, 2, 2, 2, and 2, so the function is $(z-1)^2(z-2)^4=(z^2-2z+1)(z^4-8z^3+24z^2-32z+16)$. Therefore, calculating just the $z^3$ terms, we get B = -32 - 48 - $8 =\boxed{\textbf{(A) }{-}88}.$

*~JHawk0224*
## Solution 2
Using the same method as Solution 1, we find that the roots are 2, 2, 2, 2, 1, and 1. Note that B is the negation of the 3rd symmetric sum of the roots. Using casework on the number of 1's in each of the $\binom$ {6}{3} = 20 products $r_a\cdotr_b\cdotr_c$, we obtain B= - $\left(\binom$ {4}{3} $\binom$ {2}{0} $\cdot 2^{3} + \binom$ {4}{2} $\binom{2}{1} \cdot 2^{2} \cdot 1 + \binom$ {4}{1} $\binom$ {2}{2} $\cdot 2 \right) = -\left(32+48+8 \right) = \boxed{\textbf{(A) }{-}88}.$
*~ike.chen*
## Solution 3 (brute force)
Same as solution 1, we find the roots are 1, 1, 2, 2, 2, 2 by Vieta's formula. This next part is brute force expansion.

$$-B=\\r_1r_2r_3+r_1r_2r_4+r_1r_2r_5+r_1r_2r_6+\\r_1r_3r_4+r_1r_3r_5+r_1r_3r_6+\\r_1r_4r_5+r_1r_4r_6+\\r_1r_5r_6+\\r_2r_3r_4+r_2r_3r_5+r_2r_3r_6+\\r_2r_4r_5+r_2r_4r_6+\\r_2r_5r_6+\\r_3r_4r_5+r_3r_4r_6+\\r_3r_5r_6+\\r_4r_5r_6\\=2 \times 4 + 4 \times 12 + 8 \times 4\\ =8 + 48 + 32\\B = \boxed{\textbf{(A) }{-}88}$$


*~yhbettysun*
## Video Solution (🚀 Just 2 min 🚀)
https://youtu.be/s6MGGjPv1n0

_~Education, the Study of Everything_
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=AjQARBvdZ20
## Video Solution by OmegaLearn (Using Vieta's Formulas & Combinatorics)
https://youtu.be/5U4MJTo3F5M

*~pi_is_3.14*
## Video Solution by Power Of Logic (Using Vieta's Formulas)
https://youtu.be/rl6QtVnIbdU
## Video Solution by TheBeautyofMath
https://youtu.be/t-EEP2V4nAE?t=1080 (for AMC 10A)

https://youtu.be/ySWSHyY9TwI?t=271 (for AMC 12A)

*~IceMatrix*
## Video Solution by CanadaMath
https://www.youtube.com/watch?v=8D29aL7clFc (For AMC 10A)
## See also
