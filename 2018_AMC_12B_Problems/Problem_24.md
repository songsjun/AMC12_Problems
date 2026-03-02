# 2018 AMC 12B Problem 24

> This problem is the same as [ 2018 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems#Problem_25_) and [2018 AMC 12B #24](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems#Problem_24).
## Problem 25
Let $\lfloor x \rfloor$ denote the greatest integer less than or equal to $x$. How many real numbers $x$ satisfy the equation $x^2 + 10,\lfloor x \rfloor = 10,000x$?

$\textbf{(A) } 197 \qquad \textbf{(B) } 198 \qquad \textbf{(C) } 199 \qquad \textbf{(D) } 200 \qquad \textbf{(E) } 201$
## Solution 1
This rewrites itself to $x^2=10,000\{x\}$ where $\lfloor x \rfloor + \{x\} = x$.

Graphing $y=10,000\{x\}$ and $y=x^2$ we see that the former is a set of line segments with slope $10,000$ from $0$ to $1$ with a hole at $x=1$, then $1$ to $2$ with a hole at $x=2$ etc.
Here is a graph of $y=x^2$ and $y=16\{x\}$ for visualization.

<asy>
import graph;

> [Asymptote diagram - not rendered in Markdown]

```asy
size(400);
```

xaxis("$x$",Ticks(Label(fontsize(8pt)),new real[]{-5,-4,-3, -2, -1,0,1 2,3, 4,5}));
yaxis("$y$",Ticks(Label(fontsize(8pt)),new real[]{0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18}));
real y(real x) {return $x^2$;}

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((-4,16), 0.1));
draw(circle((-3,16), 0.1));
draw(circle((-2,16), 0.1));
draw(circle((-1,16), 0.1));
draw(circle((0,16), 0.1));
draw(circle((1,16), 0.1));
draw(circle((2,16), 0.1));
draw(circle((3,16), 0.1));
draw(circle((4,16), 0.1));
draw((-5,0)--(-4,16), black);
draw((-4,0)--(-3,16), black);
draw((-3,0)--(-2,16), black);
draw((-2,0)--(-1,16), black);
draw((-1,0)--(-0,16), black);
draw((0,0)--(1,16), black);
draw((1,0)--(2,16), black);
draw((2,0)--(3,16), black);
draw((3,0)--(4,16), black);
draw(graph(y,-4.2,4.2),green);
```

</asy>

Now notice that when $x=\pm 100$ the graph has a hole at $(\pm 100,10,000)$ which the equation $y=x^2$ passes through and then continues upwards. Thus our set of possible solutions is bounded by $(-100,100)$. We can see that $y=x^2$ intersects each of the lines once and there are $99-(-99)+1=199$ lines for an answer of $\boxed{\text{(C)}~199}$.
## Solution 2
Same as the first solution, $x^2=10,000\{x\}$.


We can write $x$ as $\lfloor x \rfloor+\{x\}$. Expanding everything, we get a quadratic in $\{x\}$ in terms of $\lfloor x \rfloor$:


$$\{x\}^2+ (2\lfloor x \rfloor -10,000)\{x\} + \lfloor x \rfloor ^2 = 0$$


We use the quadratic formula to solve for $\{x\}$ :


$$\{x\} = \frac {-2\lfloor x \rfloor + 10,000 \pm \sqrt{ ( 2\lfloor x \rfloor - 10,000 )^2 - 4\lfloor x \rfloor^2  }}{2} = \frac {-2\lfloor x \rfloor + 10,000 \pm \sqrt{ 4\lfloor x \rfloor^2 -40,000 \lfloor x \rfloor + 10,000^2- 4\lfloor x \rfloor^2  }}{2}$$


Since $0 \leq \{x\} < 1$, we get an inequality which we can then solve. After simplifying a lot, we get that $\lfloor x \rfloor^2 + 2\lfloor x \rfloor - 9999 < 0$.


Solving over the integers, $-101 < \lfloor x \rfloor < 99$, and since $\lfloor x \rfloor$ is an integer, there are $\boxed{\text{(C)}~199}$ solutions. Each value of $\lfloor x \rfloor$ should correspond to one value of $x$, so we are done.
## Solution 3 (Fakesolve)
Let $x = a+k$ where $a$ is the integer part of $x$ and $k$ is the fractional part of $x$.
We can then rewrite the problem below:

$(a+k)^2 + 10000a = 10000(a+k)$

From here, we get

$(a+k)^2 + 10000a = 10000a + 10000k$

Solving for $a+k = x$

$(a+k)^2 = 10000k$

$x = a+k = \pm100\sqrt{k}$

Because $0 \leq k < 1$, we know that $a+k$ cannot be less than or equal to $-100$ nor greater than or equal to $100$. Therefore:

$-99 \leq x \leq 99$

There are $199$ elements in this range, so the answer is $\boxed{\textbf{(C)} \text{ 199}}$.


Note (not by author): this solution seems to be invalid at first, because one can not determine whether $x$ is an integer or not. However, it actually works because although $x$ itself might not be an integer, it is very close to one, so there are 199 potential $x$.


Another Note (not by author of previous note): we can actually determine that $x=0$ is the only possible integer value of $x$ is we set $x=\lfloor x \rfloor$ we end up with $x=0$   ~YJC64002776


Yet Another Note EXCEPT THIS ONE'S VERY IMPORTANT, AS IT DISPROVES THE PROOF (also not by the author of any previous notes or of the original solution): this solution claims that $-99 \leq x \leq 99$, which is not entirely true. When $x = \sqrt{26}$, the equation originally stated in the question holds true. $\sqrt{26}$ is roughly $-99.0195$ (rounded to the nearest ten thousandth), which is not in the $-99 \leq x \leq 99$ interval. It is probably by mere coincidence that this solution gives the correct answer, as the solution is not rigorous. Additionally, $x$ is not necessarily integer, so it is not claimable that there are 199 elements in the range of $-99 \leq x \leq 99$.


One More Note (not by any of the previous authors): The original guy who wrote the solution just wrote the wrong range lol this is a valid solution (at least I'm pretty sure). Given $(a+k)^2 = 10000k$, dividing each side by 10000 gives $\frac{(a+k)^2}{10000} = k$. Our original definition of $k$ states that $0 \leq k < 1$, so $0 \leq \frac{(a+k)^2}{10000} < 1$. This is equivalent to the range $-100 \leq x < 100 NOT -99 \leq x < 99$. If you observe the functions behavior, you realize that between every interval of length $1$ there is one solution, except for the intervals that include $0$, where only $0$ is a solution. There are therefore $99+99+1$ solutions in that range which gives the answer. Also $x$ literally doesn't have to be an integer the original constraint was that $x$ is a real number.
## Solution 4
Notice the given equation is equivalent to $(\lfloor x \rfloor+\{x\})^2=10,000\{x\}$

Now we know that $\{x\} < 1$ so plugging in $1$ for $\{x\}$ we can find the upper and lower bounds for the values.

$(\lfloor x \rfloor +1)^2 = 10,000(1)$

$(\lfloor x \rfloor +1) = \pm 100$

$\lfloor x \rfloor = 99, -101$

And just like $\textbf{Solution 2}$, we see that $-101 < \lfloor x \rfloor < 99$, and since $\lfloor x \rfloor$ is an integer, there are $\boxed{\text{(C)}~199}$ solutions. Each value of $\lfloor x \rfloor$ should correspond to one value of $x$, so we are done.

- $\textbf{Note}$ (not by author of any other notes beforehand): this solution is probably the best and most efficient of all. It solves the problems stated in the fakesolves./
## Solution 5
Firstly, if $x$ is an integer, then $10,\lfloor x \rfloor=10,000x$, so $x$ must be $0$.

If $0<x<1$, then we know the following:

$0<x^2<1$

$10,000\lfloor x \rfloor =0$

$0<10,000x<10,000$

Therefore, $0<x^2+10,\lfloor x \rfloor <1$, which overlaps with $0<10,000x<10,000$. This means that there is at least one real solution between $0$ and $1$. Since $x^2+10,\lfloor x \rfloor$ increases quadratically and $10,000x$ increases linearly, there is only one solution for this case.

Similarly, if $1<x<2$, then we know the following:

$1<x^2<4$

$10,000\lfloor x \rfloor =10,000$

$<10,000<10,000x<20,000$

By following similar logic, we can find that there is one solution between $1$ ad $2$.

We can also follow the same process to find that there are negative solutions for $x$ as well.

There are not an infinite amount of solutions, so at one point there will be no solutions when $n<x<n+1$ for some integer $n$. For there to be no solutions in a given range means that the range of $10,\lfloor x \rfloor + x^2$ does not intersect the range of $10,$000x. $x^2$ will always be positive, and $10,\lfloor x \rfloor$ is less than $10,000$ less than $10,000x$, so when $x^2 >= 10,000$, the equation will have no solutions. This means that there are $99$ positive solutions, $99$ negative solutions, and $0$ for a total of $\boxed{\text{(C)}~199}$ solutions.

*~Owen1204*
## Solution 6 (General Equation)
General solution to this type of equation $f(x, \lfloor x \rfloor) = 0$:

 1. solve $f(x, \lfloor x \rfloor) = 0$ for $x$ to get $x = g(\lfloor x \rfloor )$
 2. apply $\lfloor x \rfloor \le x < \lfloor x \rfloor+1$, solve $\lfloor x \rfloor \le g(\lfloor x \rfloor) < \lfloor x \rfloor+1$ to get the domain of $\lfloor x \rfloor$
 3. get $\lfloor x \rfloor$ from the domain of $\lfloor x \rfloor$ because $\lfloor x \rfloor$ is integer, then get $x$ from $\lfloor x \rfloor$ by $x = g( \lfloor x \rfloor)$
 Note: function $\lfloor x \rfloor$ maps $x$ to its floor. By solving $f(x, \lfloor x \rfloor) = 0$, we get function $x = g( \lfloor x \rfloor)$, mapping $x$'s floor to $x$

$x^2 - 10000x + 10000 \lfloor x \rfloor =0$

$x=5000 \pm 100 \sqrt{2500- \lfloor x \rfloor}$, $\lfloor x \rfloor \le 2500$

$\lfloor x \rfloor \le x < \lfloor x \rfloor + 1$

If $x= 5000 + 100 \sqrt{2500 - \lfloor x \rfloor}$, $x \ge 5000$, it contradicts $x < \lfloor x \rfloor + 1 \le 2501$

$$So $x= 5000 - 100 \sqrt{2500 - \lfloor x \rfloor}$$$

Let $k = \lfloor x \rfloor$ , $x= 5000 - 100 \sqrt{2500 - k}$

$k \le 5000 - 100 \sqrt{2500 - k} < k + 1$

$0 \le 5000 - k - 100 \sqrt{2500 - k} < 1$

$0 \le 2500 - k - 100 \sqrt{2500 - k} + 2500 < 1$

$0 \le (\sqrt{2500 - k} - 50)^2 < 1$

$-1 < \sqrt{2500 - k} - 50 < 1$

$49 < \sqrt{2500 - k} < 51$

$-101 < k < 99$

So the number of $k$'s values is $99-(-101)-1=199$. Because $x=5000-100\sqrt{2500-k}$, for each value of $k$, there is a value for $x$. The answer is $\boxed{\textbf{(C)} 199}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7 (Fakesolve)
Subtracting $\lfloor \rfloor$ from both sides gives $x^2=10000(\lfloor \rfloor)=10000\{x\}$. Dividing both sides by $10000$ gives $\left(\frac{x}{100}\right)^2=\{x\}<$1.  $\left(\frac{x}{100}\right)^2<1$ when $-100<x<100$ so the answer is $\boxed{199}$.

*~randomdude10807*
## Solution 8 (Also Gives General Formula For Values of x)
The question wants to know how many values of $x$ satisfy the equation $x^2 + 10,\lfloor x \rfloor = 10,000x$. This equation can be simplified as follows


$$x^2 + 10,000\lfloor x \rfloor = 10,000x$$


$$x^2 = 10,000(x-\lfloor x \rfloor)$$


Notice that $x\lfloor x \rfloor$ must be greater than or equal to zero, but less than one. Because of that, the right-hand side of the equation must be less than $10000$. Therefore, $-100<x<100$.

$x$ can be expressed as $a+b$, where $a$ is an integer and $b$ is a real number such that $0 \leq b < 1$. Notice that in order to satisfy the conditions set down for $x$, $-100 \leq a \leq 99$.

Substituting $a$ and $b$ into $x^2 = 10000(\lfloor x \rfloor)$, we get


$$(a+b)^2 = 10,000b$$


$$a^2+2ab+b^2 = 10,000b$$


Let's try to turn this into a quadratic equation where we're trying to solve for $b$. Simplifying, we find


$$b^2+(2a-10,000)b+a^2 = 0$$


Now the value of $b$ depends on the value of $a$. Our task is to figure out how many values of $a$ will give me valid values of $b$ (a.k.a the values of $a$ that give me $b$ such that $0 \leq b < 1$), as that will be our answer. We must also keep in mind that $-100 \leq a \leq 99$.

Using the quadratic formula, we can find


$$\frac{(-2a+10,000) \pm \sqrt{(2a-10,000)^2-4a^2}}{2}$$


The equation above represents the values of $b$ in terms of $a$. Since it represents $b$, we want values of $a$ such that the equation is between zero and one, zero inclusive. We can then conceive the inequality below.


$$0 \leq \frac{(-2a+10,000) \pm \sqrt{(2a-10,000)^2-4a^2}}{2} < 1$$


Wow, that looks like a mess! How are we supposed to easily use such a complicated expression? Maybe it would help to simplify it further. First, let's notice a few things.

*I want the numerator to be between 0 and 2, 0 inclusive. Of the $\pm$ in the quadratic formula, only the "$-$" (minus) will work. Why? Because $-2a+10000$ will always be positive (if I plug in the largest possible value of $a$, $99$, it will give $9802$), and if I want $b$ to be real, which I do, then $\sqrt{(2a-10,000)^2-4a^2}$ should also be positive. $-2a+10000$ will already be much bigger than 2, and adding more on will only make it bigger. It will never be less than 2. It will never work.

*I can simplify the numbers under the square root using Difference of Squares. I can turn $\sqrt{(2a-10,000)^2-4a^2}$ into $\sqrt{(2a-10,000)^2-(2a)^2}$. Applying Difference of Squares, it will eventually simplify out to be $\sqrt{2500-a}$.

Cool! Now we've simplified the square root and figured out that it must be a minus sign, not a plus sign. Our new inequality looks like this:


$$0 \leq \frac{(-2a+10,000) - 200\sqrt{2500-a}}{2} < 1$$


Simplifying the unsimplified fraction further, we can get this:


$$0 \leq -a + 5,000 - 100\sqrt{2500-a} < 1$$


Yay! A simpler equation. As long as the value $a$ fits this inequality, the restrictions set on $b$ are satisfied. But wait. What about the restrictions on $a$?

**By testing out $-100$ and $99$ (and finding that $-100$ gives a value very close to $1$, and that $99$ gives exactly $1$), we can conclude that any value of $-100 \leq$a$\leq 99$ will satisfy the inequality above as long as it does not make $-a + 5,000 - \sqrt{2500-a}$ equal to $1$. By testing $-100$ and $99$, you will also find that $a = 99$ will not satisfy the inequality.** <u><-- old, non-rigorous way. You can ignore it, but if you want to see a bogus way to prove it, feel free to read it.</u>

I can solve $0 \leq -a + 5000 - 100\sqrt{2500-a} < 1$ for $a$ this way:

$0 \leq -a + 5000 - 100\sqrt{2500-a} < 1$

$-5000 \leq -a - 100\sqrt{2500-a} < -4999$

$5000 \geq a + 100\sqrt{2500-a} < 4999$

$5000-a \geq 100\sqrt{2500-a} < 4999-a$

$25000000-10000a+a^2 \geq 25000000-10000a > 4999^2-9998a+a^2$

$a^2 \geq 0 > -9999+2a+a^2$

$0 \geq -a^2 > -9999+2a$

$0 \leq a^2 < 9999-2a$

$2a \leq a(a+2) < 9999$

Following the left part of the inequality,

$2a \leq a^2 + 2a$

$0 \leq a^2$

$a$ can be anything $(-\infty, \infty)$.

Following the right part of the inequality,

$a(a+2) < 9999$

$a < 99$ and $a > -101$

$a$ can be anything $(-101, 99)$.

Combining both restrictions and given previously that $-100 \leq a \leq 99$, we can conclude that the inequality describing all possible values of $a$ is $-100 \leq a < 99$.

Remember how these values of $a$ give valid values of $b$ that satisfy the desired inequality $0 \leq b < 1$ and how adding up $a$ and $b$ gives $x$. In summary, remember that the number of values of $a$ is equivalent to the number of values of $x$.

$a$ must be integer, so the number of values of $a$ that satisfy $-100 \leq a < 99$ is $\boxed{199}$.

The answer is $\boxed{\textbf{(C)} 199}$.

*~AVRILAVIGNE*


Note From Author of Solution: you may have noticed that I missed a slight bit by not proving that the thing under the square root in the quadratic formula I made was positive. Don't worry, it wasn't a mistake. It's actually pretty easy to prove. I'll leave it to you to figure out how to do it!
## Solution 9
Note that the problem rearranges itself to $x^2=10,000\{x\}$ where $\lfloor x \rfloor + \{x\} = x$.


To get a general scope of solutions, by noting that $0 \leq \{x\} < 1$, we have that $0 \leq x^2 < 10,000$. Therefore, $-100 < x < 100$.


From here, it is easy to observe that there is one solution per each integer value of $-99 \leq \lfloor x \rfloor \leq 99$. This can be reasoned by bounding $\{x\}$ for each $\lfloor x \rfloor$ (intuitively, this is because $\lfloor x \rfloor$ determines the fractional part: for each $\lfloor x \rfloor$, you will be forced to choose the value of $\{x\}$ that will satisfy the equation).


Ultimately, the answer is $99+99+1 = \boxed{\textbf{(C)} 199}$.


*~xHypotenuse*
## Video Solution
https://www.youtube.com/watch?v=vHKPbaXwJUE
## See Also
