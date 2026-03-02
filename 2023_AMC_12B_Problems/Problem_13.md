# 2023 AMC 12B Problem 13

> This problem is the same as [2023 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10B_Problems/Problem_17) and [2023 AMC 12B #13](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12B_Problems/Problem_13).
## Problem
A rectangular box $\mathcal{P}$ has distinct edge lengths a, b, and c. The sum of the lengths of all 12 edges of $\mathcal{P}$ is 13, the areas of all 6 faces of $\mathcal{P}$ is $\frac{11}{2},$ and the volume of $\mathcal{P}$ is $\frac{1}{2}.$ What is the length of the longest interior diagonal connecting two vertices of $\mathcal{P}$?

$\textbf{(A)}~2\qquad\textbf{(B)}~\frac{3}{8}\qquad\textbf{(C)}~\frac{9}{8}\qquad\textbf{(D)}~\frac{9}{4}\qquad\textbf{(E)}~\frac{3}{2}$
## Solution 1 (algebraic manipulation)
> [Asymptote diagram - not rendered in Markdown]

```asy
import geometry; pair A = (-3, 4); pair B = (-3, 5); pair C = (-1, 4); pair D = (-1, 5); pair AA = (0, 0); pair BB = (0, 1); pair CC = (2, 0); pair DD = (2, 1); draw(D--AA,dashed); draw(A--B); draw(A--C); draw(B--D); draw(C--D); draw(A--AA); draw(B--BB); draw(C--CC); draw(D--DD); // Dotted vertices dot(A); dot(B); dot(C); dot(D); dot(AA); dot(BB); dot(CC); dot(DD); draw(AA--BB); draw(AA--CC); draw(BB--DD); draw(CC--DD); label("a",midpoint(D--DD),E); label("b",midpoint(CC--DD),E); label("c",midpoint(AA--CC),S);
```


We can create three equations using the given information.

$$
4a+4b+4c = 13
2ab+2ac+2bc=\frac{11}{2}
$$

$abc=\frac{1}{2}$
We also know that we want $\sqrt{a^2 + b^2 + c^2}$ because that is the length that can be found from using the Pythagorean Theorem. We cleverly notice that $a^2 + b^2 + c^2 = (a+b+c)^2 -2(ab+ac+bc)$. We know that $a+b+c =\frac{13}{4}$ and $2(ab+ac+bc)=\dfrac{11}2,$ so $a^2 + b^2 +c^2 =\left(\frac{13}{4}\right)^2 - \frac{11}{2} = \frac{169-88}{16} = \frac{81}{16}.$ So our answer is $\sqrt{\frac{81}{16}} = \boxed{\textbf{(D)}~\tfrac94}.$

*~lprado*

*~minor edits and add-ons by Technodoggo, lucaswujc, andliu766, BcMath, and MW2014*
Note:This solution does not necessarily use the fact that $abc=\frac{1}{2},$ unlike the second solution.
## Solution 2 (Vieta's)
We use the equations from Solution 1 and manipulate it a little:

$$
a+b+c = \frac{13}{4}
ab+ac+bc=\frac{11}{4}
$$

$abc=\frac{1}{2}$
Notice how these are the equations for the vieta's formulas for a polynomial with roots of a, b, and c. Let's create that polynomial. It would be $x^3 -\frac{13}{4}x^2 +\frac{11}{4}$x - $\frac{1}{2}.$ Multiplying each term by 4 to get rid of fractions, we get $4x^3-13x^2 +11x - 2$. Notice how the coefficients add up to 0. Whenever this happens, that means that $(x-1)$ is a factor and that 1 is a root. After using synthetic division to divide $4x^3-13x^2 +11x - 2$ by $x-1$, we get $4x^2-9x + 2$. Factoring that, you get $(x-2)(4x-1)$. This means that this polynomial factors to $(x-1)(x-2)(4x-1)$ and that the roots are 1, 2, and 1/4. Since we're looking for $\sqrt{a^2 + b^2 + c^2},$ this is equal to $\sqrt{1^2 + 2^2 + \frac{1}{4}^2} = \sqrt{\frac{81}{16}} = \boxed{\textbf{(D)}~\tfrac94}$

*~lprado*
## Solution 3 (Newton's Sums)
Same formal process of Solution 2, once we have $4x^3-13x^2 + $11x - 2. Let $s_{2}= a^2 + b^2 + c^2$ and $s_{1}$ = a + b + $c =\frac{13}{4}.$ Applying [https://artofproblemsolving.com/wiki/index.php/Newton's_Sums Newton's Sums], we have ($4)s_{2}$ + (-$13)s_{1} + 2 * 11 = 0$. We can solve that $s_{2}=\frac{81}{16},$ and the interior diagonal would be $\sqrt{s_{2}} = \frac{9}{4}.$

*~DRA777*
## Solution 4 (Cheese Method)
Incorporating the solution above, we know a+b+$c = 13/4 \Rightarrow$ a+b+c > 3. The side lengths are larger than 1 $\cdot 1 \cdot 1 (a$ unit cube). The side length of the interior of a unit cube is $\sqrt{3},$ and we know that the side lengths are larger than 1 $\cdot 1 \cdot 1,$ so that means the diagonal has to be larger than $\sqrt{3},$ and the only answer choice larger than $\sqrt{3} \Rightarrow \boxed{\textbf{(D)}~\tfrac94}$

*~kabbybear*

Note that the real number $\sqrt{3}$ is around 1.73. Option A is also greater than $\sqrt{3}$ meaning there are two options greater than $\sqrt{3}.$ Option A is an integer so educationally guessing we arrive at answer D $\Rightarrow \boxed{\textbf{(D)}~\tfrac94}$

*~atictacksh*
## Video Solution 1 (FAST)
https://youtu.be/DzedU9L612w
## Video Solution 2 by OmegaLearn
https://youtu.be/bXbOPnIAKPo
## Video Solution 3 by SpreadTheMathLove
https://www.youtube.com/watch?v=lVkvcCmY9uM
## Video Solution
https://youtu.be/4jjWyikA7mg

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by MegaMath
https://www.youtube.com/watch?v=le0KSx3Cy-g&t=28s
## See Also
