# 2015 AMC 12A Problem 20

## Problem
Isosceles triangles T and T' are not congruent but have the same area and the same perimeter.  The sides of T have lengths 5, 5, and 8, while those of T' have lengths a, a, and b.  Which of the following numbers is closest to b?

$\textbf{(A) }3\qquad\textbf{(B) }4\qquad\textbf{(C) }5\qquad\textbf{(D) }6\qquad\textbf{(E) }8$
## Solution 1
The area of T is $\dfrac{1}{2} \cdot 8 \cdot 3 = 12$ and the perimeter is 18.

The area of T' is $\dfrac{1}{2}$ b $\sqrt{a^2 - (\dfrac{b}{2})^2}$ and the perimeter is $2a$ + b.

Thus $2a+b = 18$, so $2a = 18$ - b.

Thus $12 =\dfrac{1}{2}$ b $\sqrt{a^2 - (\dfrac{b}{2})^2},$ so 48 = b $\sqrt{4a^2 - b^2} =$ b $\sqrt{(18 - b)^2 - b^2} =$ b $\sqrt{324 - 36b}.$

We square and divide 36 from both sides to obtain $64 = b^2 (9 - b),$ so $b^3 -9b^2 + 64 = 0$. Since we know $b = 8$ is a solution, we divide by b - 8 to get the other solution. Thus, b^2 - b - 8 = 0, so $b =\dfrac{1 + \sqrt{33}}{2} < \dfrac{1 + 6}{2} = 3.5.$ The answer is $\boxed{\textbf{(A) }3}.$
### Solution 1.1
The area is 12, the semiperimeter is 9, and $a = 9-\frac12$b. Using Heron's formula, $\sqrt{9\left(\frac{b}{2}\right)\left(\frac{b}{2}\right)(9-b)} = 12.$ Squaring both sides and simplifying, we have $-b^3+9b^2-64=0$. Since we know $b = 8$ is a solution, we divide by b - 8 to get the other solution. Thus, b^2 - b - 8 = 0, so $b =\dfrac{1 + \sqrt{33}}{2} < \dfrac{1 + 6}{2} = 3.5.$ The answer is $\boxed{\textbf{(A) }3}.$
## Solution 2
Triangle T, being isosceles, has an area of $\frac{1}{2}(8)\sqrt{5^2-4^2}=12$ and a perimeter of $5+5+8=18$.
Triangle T' similarly has an area of $\frac{1}{2}(b)$\bigg($\sqrt{a^2-\frac{b^2}{4}}$\bigg)=12 and $2a+b=18$.

Now we apply our computational fortitude.


$$
\frac{1}{2}(b)\bigg(\sqrt{a^2-\frac{b^2}{4}}\bigg)=12
(b)\bigg(\sqrt{a^2-\frac{b^2}{4}}\bigg)=24
(b)\sqrt{4a^2-b^2}=48
b^2(4a^2-b^2)=48^2
b^2(2a+b)(2a-b)=48^2
$$

Plug in $2a+b=18$ to obtain

$$
18b^2(2a-b)=48^2
b^2(2a-b)=128
$$

Plug in $2a=18$-b to obtain

$$
b^2(18-2b)=128
2b^3-18b^2+128=0
b^3-9b^2+64=0
$$

We know that $b=8$ is a valid solution by T. Factoring out $b-8$, we obtain
$$(b-8)(b^2-b-8)=0 \Rightarrow b^2-b-8=0$$
Utilizing the quadratic formula gives
$$b=\frac{1\pm\sqrt{33}}{2}$$
We clearly must pick the positive solution. Note that 5<$\sqrt{33}<6,$ and so {3<$\frac{1+\sqrt{33}}{2}<\frac{7}{2}$}, which clearly gives an answer of $\boxed{\textbf{(A) }3},$ as desired.
## Solution 3
Triangle T has perimeter $5 + 5 + 8 = 18$ so $18 =2a$ + b.

Using Heron's, we get $\sqrt{(9)(4)^2(1)} = \sqrt{(\frac{2a+b}{2})\left(\frac{b}{2}\right)^2(\frac{2a-b}{2})}.$

We know that $2a+b = 18$ from above so we plug that in, and we also know that then $2a-b = $18 - $2b$.

$$12 = \frac{3b}{2}\sqrt{9-b}$$

$$64 = 9b^2 - b^3$$

We plug in 3 for b in the LHS, and we get 54 which is too low. We plug in 4 for b in the LHS, and we get 80 which is too high. We now know that b is some number between 3 and 4.

If b $\geq 3.5,$ then we would round up to 4, but if b < 3.5, then we would round down to 3. So let us plug in 3.5 for b.

We get 67.375 which is too high, so we know that b < 3.5.

Thus the answer is $\boxed{\textbf{(A) }3}$
## Solution 4 (Operation Descartes)
For this new triangle, say its legs have length d and the base length $2c$. To see why I did this, draw the triangle on a Cartesian plane where the altitude is part of the y-axis! Then, we notice that c+$d=9$ and $c*\sqrt{d^2-c^2}=12.$ It's better to let a side be some variable so we avoid having to add non-square roots and square-roots!!

Now, modify the square-root equation with $d=9$-c; you get $c^2*(81-18c$)=144, so -$18c^3+81c^2=144$. Divide by -9 to get $2c^3-9c^2+16=0$. Obviously, $c=4$ is a root as established by triangle T! So, use synthetic division to obtain $2c^2-c-4=0$, upon which $c=\frac{1+\sqrt{33}}{4},$ which is closest to $\frac{3}{2} (a$s opposed to 2). That's enough to confirm that the answer has to be $\boxed{\textbf{(A) }3}.$
## Solution 5 (When You're Running Out of Time)
Since triangles T' and T have the same area and the same perimeter,
$2a+b=18$ and $9*(9-a)^2(9-b) = 9*4^2*1$
By trying each answer choice, it is clear that the answer is $\boxed{\textbf{(A) }3}.$
## See Also
