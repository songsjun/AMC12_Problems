# 2007 AMC 12B Problem 23

## Problem
How many non-congruent right triangles with positive integer leg lengths have areas that are numerically equal to 3 times their perimeters?


$$\mathrm {(A)} 6\qquad \mathrm {(B)} 7\qquad \mathrm {(C)} 8\qquad \mathrm {(D)} 10\qquad \mathrm {(E)} 12$$

## Solution 1
Let a and b be the two legs of the triangle.

We have $\frac{1}{2}$ab = $3(a+b+c)$.

Then ab=6 $\left(a+b+\sqrt{a^2 + b^2}\right).$

We can complete the square under the root, and we get, ab=6 $\left(a+b+\sqrt{(a+b)^2 - 2ab}\right).$

Let ab=p and a+b=s, we have $p=6\left(s+ \sqrt{s^2 - 2p}\right).$

After rearranging, squaring both sides, and simplifying, we have p=$12s-72$.

Putting back a and b, and after factoring using Simon's Favorite Factoring Trick, we've got $(a-12)(b-12)=72$.

Factoring 72, we get 6 pairs of a and b

(13, 84), (14, 48), (15, 36), (16, 30), (18, 24), (20, 21).

And this gives us 6 solutions $\Rightarrow \mathrm{(A)}.$

Alternatively, note that $72 = 2^3 \cdot 3^2.$ Then 72 has (3+1)(2+1) = (4)(3) = 12 factors. However, half of these are repeats, so we have $\frac{12}{2} = 6$ solutions.
## Solution 2
We will proceed by using the fact that [ABC] = $r\cdot$ s, where r is the radius of the incircle and s is the semiperimeter $\left(s = \frac{p}{2}\right).$

We are given [ABC] = $3p=6s\Rightarrowrs =6s\Rightarrowr = 6$.

The incircle of ABC breaks the triangle's sides into segments such that AB = x + y, BC = x + z and AC = y + z. Since ABC is a right triangle, one of x, y and z is equal to its radius, 6. Let's assume $z = 6$.

The side lengths then become AB = x + y, BC = x + 6 and AC = y + 6. Plugging into Pythagorean's theorem:

$$(x + y)^2 = (x+6)^2 + (y + 6)^2$$

$$x^2 + 2xy + y^2 = x^2 + 12x + 36 + y^2 + 12y + 36$$

$$2xy - 12x - 12y = 72$$

$$xy - 6x - 6y = 36$$

$$(x - 6)(y - 6) - 36 = 36$$

$$(x - 6)(y - 6) = 72$$

We can factor 72 to arrive with 6 pairs of solutions: (7, 78), (8,42), (9, 30), (10, 24), (12, 18), and (14, 15) $\Rightarrow \mathrm{(A)}.$
## Solution 3
Let a and b be the two legs of the triangle, and c be the hypotenuse.

By using Area = $\frac{r}{2} (a+b+c),$ where r is the in-radius, we get:


$$
3(a+b+c) = \frac{r}{2} (a+b+c)
r=6
$$


In right triangle, r = $\frac{a+b-c}{2}$

$$
a+b-c = 12
c = a + b - 12
$$


By the triangle's area we get:


$$
\frac{ab}{2} = 6 \cdot \frac{a+b+c}{2}
ab = 6(a+b+c)
$$


By substituting c in:


$$
ab = 6(a+b+a + b - 12)
ab - 12a - 12b + 72 = 0
(a - 12)(b - 12) = 72
$$


As $72 = 2^3 \cdot 3^2,$ there are $\frac{(3+1)(2+1)}{2} = 6$ solutions, $\boxed{\textbf{(A) } 6}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 4
All pythagorean triples can be parametrized in the form $(a, b, c) = k(r^2 - s^2), k(2rs), k(r^2 + s^2)$ for positive integers k, r, s. The area being triple the perimeter implies that $k^2(r^2 - s^2)$rs = $3(k(r^2 - s^2)$ + k(2rs) + k(r^2 + s^2)). This can be simplified to get ks(r - s) = 6. Now, we get the triples (k, r, s) = (1, 7, 1), (1, 5, 2), (1, 5, 3), (1, 7, 6), (2, 4, 1), (2, 4, 3), (3, 3, 1), (3, 3, 2), (6, 2, 1). However, the ones where r and s are not different signs and relatively prime are redundant, so we get 6 triples total.
## See Also
