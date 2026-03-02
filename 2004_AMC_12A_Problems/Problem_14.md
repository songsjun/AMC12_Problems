# 2004 AMC 12A Problem 14

> This problem is the same as [2004 AMC 12A #14](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12A_Problems) and [2004 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10A_Problems/Problem_18).
## Problem
A [sequence](https://artofproblemsolving.com/wiki/index.php/sequence) of three real numbers forms an [arithmetic progression](https://artofproblemsolving.com/wiki/index.php/arithmetic_progression) with a first term of 9. If 2 is added to the second term and 20 is added to the third term, the three resulting numbers form a [geometric progression](https://artofproblemsolving.com/wiki/index.php/geometric_progression). What is the smallest possible value for the third term in the geometric progression?


$$\text {(A)}\ 1 \qquad \text {(B)}\ 4 \qquad \text {(C)}\ 36 \qquad \text {(D)}\ 49 \qquad \text {(E)}\ 81$$

## Solution 1
Let d be the common difference. Then 9, 9+$d+2=11+d, 9+2d+20=29+2d$ are the terms of the geometric progression. Since the middle term is the [geometric mean](https://artofproblemsolving.com/wiki/index.php/geometric_mean) of the other two terms, (11+d)^$2 =9(2d+29)\Longrightarrowd^2 + 4d - 140 = (d+14)$$(d-10) = 0$. The smallest possible value occurs when d = -14, and the third term is $2(-14)+29 =1\Rightarrow\boxed{\mathrm{(A)}\ 1}.$
## Solution 2(Algebra)
Let d be the common difference and r be the common ratio. Then the arithmetic sequence is 9, 9+d, and 9+$2d$. The geometric sequence (when expressed in terms of d) has the terms 9, 11+d, and 29+$2d$.  Thus, we get the following equations:

$$9r=11+d\Rightarrow d=9r-11$$

$$9r^2=29+2d$$

Plugging in the first equation into the second, our equation becomes $9r^2=29+18r-22\Longrightarrow9r^2-18r-7=0$. By the quadratic formula, r can either be $-\frac{1}{3}$ or $\frac{7}{3}.$  If r is $-\frac{1}{3},$ the third term (of the geometric sequence) would be 1, and if r is $\frac{7}{3},$ the third term would be 49.  Clearly the minimum possible value for the third term of the geometric sequence is $\boxed{\mathrm{(A)}\ 1}.$
## Solution 3
Let the three numbers be, in increasing order, 9,y,z

Hence, we have that $9-y=y-z\implies 9+z=2$y.

Also, from the second part of information given, we get that


$$\frac{9}{y+2}=\frac{y+2}{z+20}\implies 9(z+20)=(y+2)^2\implies y=3(\sqrt{z+20})-2$$


Plugging back in...

$$9+z=6(\sqrt{z+20})-4\implies (9+z)^2=36(z+20)$$

Simplifying, we get that $z^2-10z-551=0$

Applying the quadratic formula, we get that $z=\frac{10\pm \sqrt{2304}}{2}\implies \frac{10\pm48}{2}$

Obviously, in order to minimize the value of z, we have to subtract. Hence, z=-19

However, the problem asks for the minimum value of the third term in a geometric progression.

Hence, the answer is $-19+20=\boxed{1} \implies \boxed{A}$
## Solution 4
Let the arithmetic sequence be 9,9+x,9+$2x$ and let the geometric sequence be 9,11+x,29+$2x$. Now, we just try all the solutions. If the last term is 1, then x=-14. This gives the geometric sequence 9,-3,1 which indeed works. The answer is $\boxed{1} \implies \boxed{A}$

Solution by franzliszt
## Solution 5
The terms of the arithmetic progression are 9, 9+d, and 9+$2d$ for some real number d. The terms of the geometric progression are 9, 11+d, and 29+$2d$. Therefore (11+$d)^{2}=9(29+$2d$)\quad\text{so}\quadd^{2}$+$4d-140 = 0$. Thus $d=10$ or d=-14. The corresponding geometric progressions are 9, 21, 49 and 9, -3, 1, so the smallest possible value for the third term of the geometric progression is $\boxed{1} \implies \boxed{A}.$
### Solution 6(Partially Brute Force)
List out the first few terms arithmetic progressions and their corresponding geometric progressions. List both the positive and negative. Then you will find that the answer is $\boxed{A}.$
## Video Solution
https://youtu.be/qy3ewAuOcSw

Education, the Study of Everything
## Video Solution by OmegaLearn
https://youtu.be/HISL2-N5NVg?t=20

*~pi_is_3.14*
## See also
