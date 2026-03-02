# 2020 AMC 12B Problem 9

> This problem is the same as [2020 AMC 10B #10](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #9](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
A three-quarter sector of a circle of radius $4$ inches together with its interior can be rolled up to form the lateral surface area of a right circular cone by taping together along the two radii shown. What is the volume of the cone in cubic inches?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Arc((0,0), 4, 0, 270));
draw((0,-4)--(0,0)--(4,0));
label("$4$", (2,0), S);
```

</asy>

$\textbf{(A)}\ 3\pi \sqrt5 \qquad\textbf{(B)}\ 4\pi \sqrt3 \qquad\textbf{(C)}\ 3 \pi \sqrt7 \qquad\textbf{(D)}\ 6\pi \sqrt3 \qquad\textbf{(E)}\ 6\pi \sqrt7$
## Solutions
### Solution 1
Notice that when the cone is created, the 2 shown radii when merged will become the slant height of the cone and the intact circumference of the circle will become the circumference of the base of the cone.

We can calculate that the intact circumference of the circle is $\pi\cdot\frac{3}{4}=6\pi$. Since that is also equal to the circumference of the cone, the radius of the cone is $3$. We also have that the slant height of the cone is $4$. Therefore, we use the Pythagorean Theorem to calculate that the height of the cone is $\sqrt{4^2-3^2}=\sqrt7$. The volume of the cone is $\frac{1}{3}\cdot\pi\cdot3^2\cdot\sqrt7=\boxed{\textbf{(C)}\ 3 \pi \sqrt7 }$

*~PCChess*
### Solution 2 (Last Resort/Cheap)
Using a ruler, measure a circle of radius 4 and cut out the circle and then the quarter missing. Then, fold it into a cone and measure the diameter to be 6 cm $\implies r=3$. You can form a right triangle with sides 3, 4, and then through the Pythagorean theorem the height $h$ is found to be $h^2 = 4^{2} - 3^{2} \implies h = \sqrt{7}$. The volume of a cone is $\frac{1}{3}\pi r^{2}h$. Plugging in we find $V = \pi \sqrt{7} \implies \boxed{\textbf{(C)}}$

- DBlack2021
### Solution 3
The radius of the given $\frac{3}{4}$ - circle will end up being the slant height of the cone. Thus, the radius and height of the cone are legs of a right triangle with hypotenuse $4$. The volume of a cone is $\frac{1}{3}\pi r^{2}h$. Using this with the options, we can take out the $\pi$ and multiply the coefficient of the radical by $3$ to get $r^{2}h$. We can then use the $r$ and $h$ values to see that the only option that satisfies $r^2+h^2=4^2=16$ is $\boxed{\textbf{(C)}}$

- ColtsFan10
## Video Solution 1
[//youtu.be/zQ9GHc6u6dM ~Education, the Study of Everything]
## Video Solution by TheBeautyOfMath
https://youtu.be/OHR_6U686Qg
## Video Solution 3
https://youtu.be/6ujfjGLzVoE
## Video Solution by WhyMath
https://youtu.be/4OAhfceUJXc

*~savannahsolver*
## See Also
