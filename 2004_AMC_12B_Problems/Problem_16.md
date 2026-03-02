# 2004 AMC 12B Problem 16

## Problem
A function f is defined by f(z) = $i\overline{z},$ where $i=\sqrt{-1}$ and $\overline{z}$ is the complex conjugate of z. How many values of z satisfy both |z| = 5 and $f(z) = z$?


$$\mathrm{(A)}\ 0 \qquad\mathrm{(B)}\ 1 \qquad\mathrm{(C)}\ 2 \qquad\mathrm{(D)}\ 4 \qquad\mathrm{(E)}\ 8$$

## Solutions
### Solution 1
Let z = a+bi, so $\overline{z} =$ a-bi. By definition, z = $a+bi =f(z) = i(a-bi)$ = b+ai, which implies that all solutions to $f(z) = z$ lie on the line y=x on the complex plane. The graph of |z| = 5 is a [circle](https://artofproblemsolving.com/wiki/index.php/circle) centered at the origin, and there are 2 $\Rightarrow \mathrm{(C)}$ intersections.
### Solution 2
Let z=a+bi, like above. Therefore, z = $a+bi =i\overline{z} =$ i(a-bi) = ai+b. We move some terms around to get bi-b = ai-a. We factor: b$(i-1) = a(i-1)$. We divide out the common factor to see that b = a. Next we put this into the definition of |z| $= a^2 + b^2 = a^2 +a^2 =2a^2 = 25$. Finally, $a =\pm\sqrt{\frac{25}{2}},$ and a has two solutions.
### Solution 3
Via trig, let z=r($\cos(x)+i\sin(x)).$ Since we wish for |z|=5, let $r=5$. We want to find $x\in$ [0, $2\pi)$ such that $f(z)=i\overline{z}.$ Note that $\overline{z}=5(\cos(x)-i\sin(x)),$ meaning $i\overline{z}=5(i\cos(x)+\sin(x)).$ Thus, we have: $5($\cos(x)$+i\sin(x))=5(i\cos(x)+\sin(x)).$ Grouping the real and imaginary values, we get that $\cos(x)=\sin(x).$ Note that this has two solutions in [0, $2\pi).$ Thus, there are 2 valid solutions.
## See also
