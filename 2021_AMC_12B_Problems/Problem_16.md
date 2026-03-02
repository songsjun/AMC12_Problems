# 2021 AMC 12B Problem 16

## Problem
Let g(x) be a polynomial with leading coefficient 1, whose three roots are the reciprocals of the three roots of $f(x)=x^3+ax^2+bx+c$, where 1 What is g(1) in terms of a,b, and c?$\textbf{(A) }\frac{1+a+b+c}$c $\qquad \textbf{(B) }1+a+b+c \qquad \textbf{(C) }\frac{1+a+b+c}{c^2}\qquad \textbf{(D) }\frac{a+b+c}{c^2} \qquad \textbf{(E) }\frac{1+a+b+c}{a+b+c}$
## Solution 1
Note that f(1/x) has the same roots as g(x), if it is multiplied by some monomial so that the leading term is $x^3$ they will be equal. We have f(1/x) = $\frac{1}{x^3} + \frac{a}{x^2}+\frac{b}{x} +$ c so we can see that g(x) = $\frac{x^3}{c}$f(1/x) Therefore g(1) = $\frac{1}{c}$f(1) = $\boxed{\textbf{(A) }\frac{1+a+b+c}c}$
## Solution 2 (Vieta's bash)
Let the three roots of f(x) be d, e, and f. (Here e does NOT mean 2.7182818...) We know that a=-(d+e+f), b=de+ef+df, and c=-def, and that g(1)=1-$\frac{1}{d}-\frac{1}{e}-\frac{1}{f}+\frac{1}{de}+\frac{1}{ef}+\frac{1}{df}-\frac{1}{def} ($Vieta's). This is equal to $\frac{def-de-df-ef+d+e+f-1}{def},$ which equals $\boxed{(\textbf{A}) \frac{1+a+b+c}{c}}. -d$stanz5
## Solution 3 (Fakesolve)
Because the problem doesn't specify what the coefficients of the polynomial actually are, we can just plug in any arbitrary polynomial that satisfies the constraints. Let's take $f(x) = (x+5)^3 = x^3+15x^2+75x+125$. Then f(x) has a triple root of x = -5. Then g(x) has a triple root of $-\frac{1}{5},$ and it's monic, so g(x) = $\left(x+\frac{1}{5}\right)^3 = \frac{125x^3+75x^2+15x+1}{125}.$ We can see that this is $\frac{1+a+b+c}{c},$ which is answer choice $\boxed{(A)}. -$Darren Yao
## Solution 4
If we let p, q,  and r be the roots of f(x), $f(x) = (x-p)(x-q)(x-r)$ and g(x) = $\left(x-\frac{1}{p}\right)\left(x-\frac{1}{q}\right)\left(x-\frac{1}{r}\right).$ The requested value, g(1), is then $\left(1-\frac{1}{p}\right)\left(1-\frac{1}{q}\right)\left(1-\frac{1}{r}\right) = \frac{(p-1)(q-1)(r-1)}{pqr}$ The numerator is -f(1) (using the product form of f(x) ) and the denominator is -c, so the answer is $\frac{f(1)}{c} = \boxed{(\textbf{A}) \frac{1+a+b+c}{c}} -$ gting
## Solution 5 (Good at Guessing)
The function g(1) = $\text{sum of coefficients}.$ If it's (x-r)(x-s)(x-t), then it becomes ($x-\dfrac{1}{r})(x-\dfrac{1}{s})(x-\dfrac{1}{t}).$ So, -rst becomes $-\dfrac{1}{rst},$ so c becomes $\dfrac{1}{c}.$ Also, there is $a x^3$ so the answer must include 1. The only answer having both of these is A. ~smellyman -Extremelysupercooldude (Minor Latex Edits and Grammar)
## Solution 6
It is well known that reversing the order of the coefficients of a polynomial turns each root into its corresponding reciprocal. Thus, a polynomial with the desired roots may be written as $cx^3+bx^2+a+1$. As the problem statement asks for a monic polynomial, our answer is $\boxed{(\textbf{A}) \frac{1+a+b+c}{c}}$
## Video Solution (🚀Under 2 min 🚀)
https://youtu.be/vPw6VxuZvQU _~Education, the Study of Everything_
## Video Solution by OmegaLearn
https://youtu.be/M4Ffhp9NLKY?t=923 ~ pi_is_3.14
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=vCEJzhDRUoU
## Video Solution by OmegaLearn (Vieta's Formula)
https://youtu.be/afrGHNo_JcY
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## See Also
