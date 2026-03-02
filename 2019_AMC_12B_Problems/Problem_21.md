# 2019 AMC 12B Problem 21

## Problem
How many quadratic polynomials with real coefficients are there such that the set of roots equals the set of coefficients? (For clarification: If the polynomial is $ax^2+bx+c,a\neq 0,$ and the roots are r and s, then the requirement is that $\{a,b,c\}=\{r,s\}$.)

$\textbf{(A) } 3 \qquad\textbf{(B) } 4 \qquad\textbf{(C) } 5 \qquad\textbf{(D) } 6 \qquad\textbf{(E) } \text{infinitely many}$
## Solution
Firstly, if r=s, then a=b=c, so the equation becomes $ax^2 + ax +a = 0\Rightarrowx^2 + x + 1=0,$ which has no real roots.

Hence there are three cases we need to consider:

**Case 1**: a=b=r and c=s $\neq$ r:
The equation becomes $ax^2+ax+c=0$, and by Vieta's Formulas, we have a+c=-1 and $ac =\frac{c}{a}.$ This second equation becomes $(a^2-1)c=0$. Hence one possibility is $c=0$, in which case a=-1, giving the equation $-x^2 -x = 0$, which has roots 0 and {-}1. This gives one valid solution. On the other hand, if $c\neq 0,$ then $a^2-1=0$, so $a =\pm 1.$ If $a=1$, we have c=-2, and the equation is $x^2 + x - 2 = 0,$ which clearly works, giving a second valid solution. If a=-1, then we have $c=0$, which has already been considered, so this possibility gives no further valid solutions.

**Case 2**: a=c=r, b=s $\neq$ r:
The equation becomes $ax^2 + bx +a = 0$, so by Vieta's Formulas, we have $a+b =-\frac{b}{a}$ and ab = 1. These equations reduce $to a^3 + a + 1 = 0.$ By sketching a graph of this function, we see that there is exactly one real root. (Alternatively, note that as it is of odd degree, there is at least one real root, and by differentiation, it has no stationary points, so there is at most one real root. Combining these gives exactly one real root.) This gives a third valid solution.

**Case 3**: a=r, b=c=s $\neq$ r:
The equation becomes $ax^2 + bx+b=0$, so by Vieta's Formulas, we have $a+b =-\frac{b}{a}$ and $ab =\frac{b}{a}.$
Observe that b $\neq 0,$ as if it were 0, the equation would just have one real root, 0, so this would not give a valid solution. Thus, taking the second equation and dividing both sides by b, we deduce have $a=\frac{1}{a},$ so $a=\pm 1.$ If $a=1$, we have 1+b=-b, giving $b=-\frac{1}{2},$ so the equation is $x^2 -\frac{1}{2}$x - $\frac{1}{2} = 0,$ which is a fourth valid solution. If a=-1, we have 1+b=b, which is a contradiction, so this case gives no further valid solutions.

Hence the total number of valid solutions is $\boxed{\textbf{(B) } 4}.$
## See Also
