# 2024 AMC 12B Problem 20

## Problem
Suppose A, B, and C are points in the plane with AB=40 and AC=42, and let x be the length of the line segment from A to the midpoint of $\overline{BC}.$ Define a function f by letting f(x) be the area of $\triangle ABC.$ Then the domain of f is an open interval (p,q), and the maximum value r of f(x) occurs at x=s. What is p+q+r+s?

$\textbf{(A) }909\qquad \textbf{(B) }910\qquad \textbf{(C) }911\qquad \textbf{(D) }912\qquad \textbf{(E) }913\qquad$
## Solution 1
Let the midpoint of BC be M, and let the length BM = CM = a. We know there are limits to the value of x, and these limits can probably be found through the triangle inequality. But the triangle inequality relates the third side length BC to AC and AB, and doesn't contain any information about the median. Therefore we're going to have to write the side BC in terms of x and then use the triangle inequality to find bounds on x.

We use Stewart's theorem to relate BC to the median AM: man + dad = bmb + cnc. In this case $m =\frac{a}2,n=\frac{a}2,$ a = m+n, d = x, $b = 42, c = 40$.

Therefore we get the equation $2a^3 + 2ax^2 = a \cdot 42^2 +$ a $\cdot 40^2$

$$2a^2 + 2x^2 = 42^2 + 40^2.$$

Notice that since 20-21-29 is a pythagorean triple, this means $2a^2+2x^2 = 58^2$.


$$
\implies a^2 = \frac{58^2}{2}-x^2
\implies a = \sqrt{\frac{58^2}{2}-x^2}
$$


By triangle inequality, $2a+40>42\implies$ a>1  and 40+$42>$2a $\implies$ a<41

Let's tackle the first inequality: $\sqrt{\frac{58^2}{2}-x^2}>1 \impliesx^2<\frac{58^2}{2}-1$

$$\implies x^2 < \frac{40^2+42^2}{2}-1 \implies x^2<41^2$$

Here we use the property that $\frac{x^2+(x+2)^2}{2}-1 = (x+1)^2.$

Therefore in this case, x<41.

For the second inequality, $\sqrt{\frac{58^2}{2}-x^2} < 41 \impliesx^2>\frac{58^2}{2}-41^2$

$$\implies x^2 > \frac{58^2}{2}-1 + 1 - 41^2$$

$$\implies x^2 > 41^2 + 1 - 41^2 \implies x^2 > 1 \implies x > 1$$

Therefore we have 1, so the domain of f(x) is (1,41). The area of this triangle is $\frac{1}{2} 42 \cdot 40 \cdot \sin(\theta).$ The maximum value of the area occurs when the triangle is right, i.e. $\theta = 90^{\circ}.$ Then the area is $\frac{1}{2} \cdot 40 \cdot 42 = 840.$ The length of the median of a right triangle is half the length of it's hypotenuse, which squared is 40^2+42^2 = 58^2. Thus the length of x is 29. Our final answer is $1+41+840+29 =\boxed{\textbf{911 } (C)}$ ~KingRavi
## Solution 2 (Geometry)
[thumb|center|300px|](https://artofproblemsolving.com/wiki/index.php/Image:2024_amc_12B_P20.PNG) Let midpoint of BC as M, extends AM to D and MD=x, triangle ACD has 3 sides (40,42,$2x$) , based on triangle inequality,  42 - $40 < 2$x < 42 + 40  1 < x < 41 so $p = $1, $q=412\cdotf(x) = 40\cdot 42 \cdot \sin(A) \le 2\cdot840$ so $r = 840$  which is achieved when A = $90^\circ$ , then $\angle ACD = 90^\circ (2x)^2 = 40^2 + 42^2x = 29s= 29 p+q+s+r = 1 + 41 + 29 + $840 = \fbox{$\textbf{(C) } 911$} ~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Solution 3 (Trigonometry)
Let A = (0, 0) , B =(b, 0) , C= ($c\cos\theta$ , $c\sin\theta )  M = \left(\frac{b + c\cos\theta}{2}, \frac{c\sin\theta}{2}\right).  AM =x =\sqrt{\left(\frac{b + c\cos\theta}{2}\right)^2 + \left(\frac{c\sin\theta}{2}\right)^2} = \frac{\sqrt{c^2 + 2bc\cos\theta+b^2}}{2}.$  When  $\cos\theta = $1 :  $x =\frac{\sqrt{(c+b)^2}}{2} = \frac{c+b}{2} = \frac{42+40}{2} = 41.$  When  $\cos\theta = -$1 :  $x =\frac{\sqrt{(c-b)^2}}{2} = \frac{c-b}{2} = \frac{42-40}{2} = 1.$  The domain of  f(x)  is the open interval:  $\boxed{(1, 41)}.$  The rest follows Solution 2
## Solution 4 (Apollonius)
Here's a faster way to solve this problem using Apollonius's Theorem (which is a special case of Stewart's Theorem for medians). In this case, {x}^$2=\frac{1}{4}*(2{AB}^2+2{AC}^2-{BC}^2). So,x^2=1682-\frac{1}{4}*{BC}^2.$ We know that, by the Triangle Inequality, 2. Applying these to Apollonius, we have that the minimum value of x is $x=1$ and the maximum value is $x=41$ (both cannot be reached, however). The rest of the solution follows Solution 1. ~xHypotenuse
## Solution 5 (Median length formula)
Let the midpoint of BC be D. Then, by the Median Length Formula: $2*AD^2 = AB^2 - BD^2 + AC^2 - CD^2.$ If we let BC = $2n$ and AD = x, then we get the relationship that: $x =\sqrt{1682-n^2}.$ By the Triangle Inequality 2 < BC < 82, so 1 < n < 41. This means that the domain of x is ($\sqrt{1}, \sqrt{1681}) = (1, 41).$ The rest follows Solution 1. ~mathwizard123123
## Solution 6 (AM-GM Inequality)
By letting BC equal {$2a$}, we can use Heron's formula to calculate the area. Notice the semi-perimeter is just $\frac{40 + 42 + 2a}{2}$ which is just {a + 41}. Next, by Heron's formula, the area of ABC is: $\sqrt{(a + 41)(a + 1)(a - 1)(41 - a)}$ which simplifies to the $\sqrt{(a^2 - 1)(41^2 - a^2)}.$ We now know that the domain of {f(x)} is just the domain of $\sqrt{(a^2 - 1)(41^2 - a^2)}.$ This domain is very easy to calculate. We see that $a^{2} > 1$ and $a^{2}<41^{2}$. Because {a} is always positive, we see that {a} is in the open interval {(1, 41)}. Now, we find the maximum of {f(x)}. By the AM-GM inequality, we have: $\frac{((a^2 - 1) + (41^2 - a^2))}{2}$ ≥ $\sqrt{(a^2 - 1)(41^2 - a^2)}.$ Simplifying and letting $\sqrt{(a^2 - 1)(41^2 - a^2)} =$ {f(x)}, we get that {f(x)} ≤ $\frac{41^2 - 1}{2} =$ {840}. We know by AM-GM that {f(x)} = {840} if and only if $a^{2}-1 =41^{2}-a^{2}$. Solving, {a} = {29}. Therefore, we have found the domain of {f} is the open interval {(1, 41)} and the maximum of {f} is {840} which occurs at {x} = {29}(Apply Stewart's to triangle ABC when knowing that BC = {58}.) Adding these up, we get {1 + 41 + 840 + 29} = {911} or $\boxed{C}.$ ~ilikemath247365
## Solution 7 (Cheese (Barely Any Risk and So Much Easier))
We can easily see that $\text{Dom}(f)=(1, 41)$ by considering extreme cases of degenerate triangles (B is on AC or A is on BC). Then, the maximum area is extremely likely to be when the triangle is right, which happens when BC=58 (20-21-29 triangle, but scaled up). The area of this triangle is 840. Since 40 $\approx 42,$ the median length is approximately equal to the altitude length, which is $\frac{1680}{58}=\frac{840}{29}=\frac{870-30}{29}=30-\frac{30}{29} \approx 29.$ Thus, the answer is $1+41+840+29=\boxed{(\text{C}) \; 911}.$ ~scjh999999
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=aDajQGay0TQ
## See also
