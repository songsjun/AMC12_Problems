# 2007 AMC 12A Problem 9

> This problem is the same as [2007 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2007_AMC_12A_Problems) and [2007 AMC 10A #13](https://artofproblemsolving.com/wiki/index.php/2007_AMC_10A_Problems/Problem_13).

The trip from Carville to Nikpath requires $4\frac 12$ hours when traveling at an average speed of 70 miles per hour. How many hours does the trip require when traveling at an average speed of 60 miles per hour? Express your answer as a decimal to the nearest hundredth.
## Simple Solution
Let x represent the distance from home to the stadium, and let r represent the distance from Yan to home. Our goal is to find $\frac{r}{x-r}.$ If Yan walks directly to the stadium, then assuming he walks at a rate of 1, it will take him x-r units of time. Similarly, if he walks back home it will take him r + $\frac{x}{7}$ units of time. Because the two times are equal, we can create the following equation: x-r = r + $\frac{x}{7}.$ We get $x-2r=\frac{x}{7},$ so $\frac{6}{7}$x = $2r$, and $\frac{x}{r} = \frac{7}{3}.$ This minus one is the reciprocal of what we want to find: $\frac{7}{3}-1 = \frac{4}{3},$ so the answer is $\boxed{\mathrm{(B)}\ \frac{3}{4}}$
## Solution 1
Let the distance from Yan's initial position to the stadium be a and the distance from Yan's initial position to home be b. We are trying to find b/a, and we have the following identity given by the problem:


$$
\begin{align*}a &= b + \frac{a+b}{7}\\ \frac{6a}{7} &= \frac{8b}{7} \Longrightarrow 6a = 8b\end{align*}
$$


Thus $b/a =6/8 = 3/4$ and the answer is $\mathrm{(B)}$\ $\frac{3}{4}$

Note: The identity can be given from an application of $t=\frac$ dr.
## Solution 2
Another way of solving this problem is by setting the distance between Yan's home and the stadium, thus filling in one variable.
Let us set the distance between the two places to be $42z$, where z is a random measurement (cause life, why not?). The time going to his home then riding his bike, which is 7 times faster, to the stadium is equal to the time it takes for him to walk to the stadium. So the equation would be:
Let x= the distance from Yan's position to his home.
Let $42z$= the distance from Yan's home to the stadium.

$$42z-x=x+\frac{42z}{7}$$

$$42z-x=x+6z$$

$$36z=2x$$

$$x=18z$$

But we're still not done with the question. We know that Yan is $18z$ from his home, and is also 42$z-18$z or $24z$ from the stadium.
$\frac{18z}{24z}$  , the z's cancel out, and we are left with $\frac{3}{4}.$
Thus, the answer is $\mathrm{(B)}$\ $\frac{3}{4}$

*~ProGameXD*

*~minor edits by mobius247*
## Solution 3
Assume that the distance from home to the stadium is 1, and the distance from Yan to home is b. Also assume that the speed of walking is 1, so the speed of biking is 7. Thus
$$1-b=b+\frac{1}{7} \Longrightarrow b=\frac{3}{7}.$$
We want to find $\frac{b}{1-b}$ which is equal to

$$\frac{3}{7} \div \frac{4}{7} = \mathrm{(B)}\ \frac{3}{4}$$
## Solution 4
> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(7,0)); dot((0,0)); dot((3,0)); dot((6,0)); dot((7,0)); label("$H$",(0,0),S); label("$Y$",(3,0),S); label("$P$",(6,0),S); label("$S$",(7,0),S);
```

Let H represent Yan's home, S represent the stadium, and Y represent Yan's current position. If Yan walks directly to the stadium, he will reach Point P the same time he will reach H if he is walking home.
Since he bikes 7 times as fast as he walks and the time is the same, the distance from his home to the stadium must be 7 times the distance from P to the stadium. If PS=x, then HS=$7x$ and HP=$6x$. Since Y is the midpoint of $\overline{HP}, HY=YP=3$x. Therefore, the ratio of Yan's distance from his home to his distance from the stadium is $\frac{YH}{YS}=\frac{3x}{4x}=\boxed{\mathrm{(B)}\ \frac{3}{4}}$
## Video Solution
https://youtu.be/b0pxcJH-984

*~savannahsolver*
## See also
