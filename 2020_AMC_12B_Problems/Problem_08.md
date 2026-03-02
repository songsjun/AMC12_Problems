# 2020 AMC 12B Problem 8

> This problem is the same as [2020 AMC 10B #9](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #8](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
How many ordered pairs of integers $(x, y)$ satisfy the equation

$$x^{2020}+y^2=2y?$$


$\textbf{(A) } 1 \qquad\textbf{(B) } 2 \qquad\textbf{(C) } 3 \qquad\textbf{(D) } 4 \qquad\textbf{(E) } \text{infinitely many}$
## Solutions
### Solution 1
Rearranging the terms and and completing the square for $y$ yields the result $x^{2020}+(y-1)^2=1$. Then, notice that $x$ can only be $0$, $1$ and $-1$ because any value of $x^{2020}$ that is greater than 1 will cause the term $(y-1)^2$ to be less than $0$, which is impossible as $y$ must be real. Therefore, plugging in the above values for $x$ gives the ordered pairs $(0,0)$, (1,1), (-1,1)$$, and $(0,2)$ gives  a  total  of $\boxed{\textbf{(D) }4}$ ordered pairs.
### Solution 2
Bringing all of the terms to the LHS, we see a quadratic equation

$$y^2 - 2y + x^{2020} = 0$$

 in terms of $y$. Applying the quadratic formula, we get

$$y = \frac{2\pm\sqrt{4-4\cdot1\cdot x^{2020}}}{2}=\frac{2\pm\sqrt{4(1-x^{2020})}}{2}.$$

 In order for $y$ to be real, which it must be given the stipulation that we are seeking integral answers, we know that the discriminant, $4(1-x^{2020})$ must be nonnegative. Therefore,

$$4(1-x^{2020}) \geq 0 \implies x^{2020} \leq 1.$$

 Here, we see that we must split the inequality into a compound, resulting in $-1 \leq x \leq 1$.

The only integers that satisfy this are $x \in \{-1,0,1\}$. Plugging these values back into the quadratic equation, we see that $x = \{-1,1\}$ both produce a discriminant of $0$, meaning that there is only 1 solution for $y$. If $x = \{0\}$, then the discriminant is nonzero, therefore resulting in two solutions for $y$.

Thus, the answer is $2 \cdot 1 + 1 \cdot 2 = \boxed{\textbf{(D) }4}$.

*~Tiblis*
### Solution 3: Solve for x first
Set it up as a quadratic in terms of y:


$$y^2-2y+x^{2020}=0$$


Then the discriminant is


$$\Delta = 4-4x^{2020}$$


This will clearly only yield real solutions when $|x^{2020}| \leq 1$, because the discriminant must be positive.
Then $x=-1,0,1$. Checking each one:
$-1$ and $1$ are the same when raised to the 2020th power:


$$y^2-2y+1=(y-1)^2=0$$


This has only has solutions $1$, so $(\pm 1,1)$ are solutions.
Next, if $x=0$:


$$y^2-2y=0 \Rightarrow y(y-2)=0$$


Which has 2 solutions, so $(0,2)$ and $(0,0)$.

These are the only 4 solutions, so our answer is $\boxed{\textbf{(D) } 4}$.

*~edits by BakedPotato66*
### Solution 4: Solve for y first
Move the $y^2$ term to the other side to get $x^{2020}=2y-y^2 = y(2-y)$.

Because $x^{2020} \geq 0$ for all $x$, then $y(2-y) \geq 0 \Rightarrow y = 0,1,2$.

If $y=0$ or $y=2$, the right side is $0$ and therefore $x=0$.

When $y=1$, the right side become $1$, therefore $x=1,-1$.

Our solutions are $(0,2)$, (0,0), (1,1), (-1,1)$$. These are the only $4$ solutions, so the answer is $\boxed{\textbf{(D) } 4}$

- wwt7535

*~edits by BakedPotato66*
### Solution 5: Similar to solution 4
Since $x^{2020}$ and $y^2$ are perfect squares, they are both nonnegative. That means $y^2$ plus a nonnegative number equals $2y$, which means $y^2 \leq 2y.$ The only possible integer values for $y$ are $0, 1, 2$.

For $y=0, x$ can only be $0$.

For $y=1, x^2=1$ so $x=1, -1$.

For $y=2, x$ can only be $0$ as well.

This gives us the solutions $(0, 0)$, (1, 1), (-1, 1)$$, and $(0, 2)$. These are the only solutions, so there is a total of $\boxed{\textbf{(D) } 4}$ ordered pairs.

- kc1374
### Solution 6: (Casework)
We see that $x$ has to be $1$, $0$, or $-1$, as any other integer would make this value too large. We also know that because $2020$ is even, both $-1$, and $1$ for $x$ will yield the same $x^{2020}$ value of $1$.

**Case 1**: $x=0$. This gives us that $y^2 = 2y$. Dividing both sides by $y$ gives us $y = 2$. Additionally, we know intuitively that $y = 0$ is also a case, which gives us 2 possibilities for this case.

**Case 2**: $x = 1$ or $-1$. This gives us that $1 + y^2 = 2y$. Bringing the $2y$ to the other side, we have a simple quadratic.  $y^2-2y + 1 = 0$. Factor to get $(y-1)^2 = 0$ so $y = 1$. Because this works for $x$ as $-1$ and $1$, there are 2 possibilities for this case.

Adding the cases gets us our final answer of $\boxed{\textbf{(D) } 4}$ ordered pairs.
*~iluvme*
### Solution 7: (Casework)
We can move the $y^2$ term to the other side to obtain $x^{2020} = 2y - y^2$, which can be easily factored into $x^{2020} = (2-y)y$. If we raise each side to the power 1/2020, we get $x = ((2-y)(y))^{1/2020}$. Since we're dealing with integer values, the inside of the square root and thus $(2-y)y$ must be greater than $0$. For this to happen, $y$ must be between $0$ and $2$ inclusive. Testing each integer value, we get the cases:

$\textbf{Case 1}$: When $y=0$, then $y(2-y)$ is also 0, and since the square root of $0$ is $0$, $x$ must also be $0$. So our first pair of solutions is $(0,0)$.

$\textbf{Case 2}$: When $y=1$, then $y(2-y)$ is also 1. The possible values for $x$ are $1$ and $-1$, so we get 2 more pairs of solutions: $(1, -1)$ and $(1,1)$.

$\textbf{Case 3}$: When $y=2$, then $y(2-y)$ is $0$, and since the square root of $0$ is $0$, $x$ must also be $0$ - so we get one more pair of solutions, $(2,0)$

If we count all these pairs$((0,0),(1,-1),(1,1),(2,0))$, we have 4 pairs of solutions, so our answer is  $\boxed{\textbf{(D) } 4}$ ordered pairs.

- youtube.com/indianmathguy
### Video Solution (HOW TO CREATIVELY PROBLEM SOLVE!!!)
https://youtu.be/FfATkdxncG4

*~Education, the Study of Everything*
### Video Solution 1 by TheBeautyOfMath
https://youtu.be/6ujfjGLzVoE
### Video Solution by WhyMath
https://youtu.be/7dQ423hhgac

*~savannahsolver*
### Video Solution by Sohil Rathi
https://youtu.be/zfChnbMGLVQ?t=4251
## See Also
